from __future__ import annotations
from typing import Iterable, List, Set
from ninja import NinjaAPI
from ninja.errors import HttpError
from .models import Employee, Alert
from .schemas import AlertOut, EmployeeOut

api = NinjaAPI(title="Manager Alerts API")

ALLOWED_SEVERITIES = {"low", "medium", "high"}
ALLOWED_STATUS = {"open", "dismissed"}
ALLOWED_SCOPE = {"direct", "subtree"}

def get_direct_reports(manager_id: str) -> List[str]:
    return list(Employee.objects.filter(reports_to=manager_id).values_list("id", flat=True))

def traverse_subtree(manager_id: str) -> List[str]:
    visited: Set[str] = set()
    result: List[str] = []

    queue = list(
        Employee.objects.filter(reports_to=manager_id)
        .values_list("id", flat=True)
    )

    while queue:
        eid = queue.pop(0)

        # ⛔ Skip the manager ID (cycle loops can reach it)
        if eid == manager_id:
            continue

        if eid in visited:
            continue

        visited.add(eid)
        result.append(eid)

        # enqueue children of this employee
        children = list(
            Employee.objects.filter(reports_to=eid)
            .values_list("id", flat=True)
        )
        queue.extend(children)

    return result



def employees_for_scope(manager_id: str, scope: str) -> List[str]:
    return get_direct_reports(manager_id) if scope == "direct" else traverse_subtree(manager_id)

@api.get("/alerts", response=List[AlertOut])
def list_alerts(request, manager_id: str, scope: str | None = None,
                severity: str | None = None, q: str | None = None,
                status: str | None = None):
    if not Employee.objects.filter(id=manager_id).exists():
        raise HttpError(404, "manager not found")

    scope_val = (scope or "direct").lower()
    if scope_val not in ALLOWED_SCOPE:
        raise HttpError(400, "invalid scope")

    severities: Iterable[str] | None = None
    if severity:
        severities = {s.strip().lower() for s in severity.split(",") if s.strip()}
        if not severities.issubset(ALLOWED_SEVERITIES):
            raise HttpError(400, "invalid severity")

    statuses: Iterable[str] | None = None
    if status:
        statuses = {s.strip().lower() for s in status.split(",") if s.strip()}
        if not statuses.issubset(ALLOWED_STATUS):
            raise HttpError(400, "invalid status")

    employee_ids = employees_for_scope(manager_id, scope_val)
    qs = Alert.objects.select_related("employee").filter(employee__id__in=employee_ids).order_by("-created_at", "id")
    if severities:
        qs = qs.filter(severity__in=severities)
    if statuses:
        qs = qs.filter(status__in=statuses)
    if q:
        qs = qs.filter(employee__name__icontains=q)

    return [
        AlertOut(
            id=a.id,
            employee=EmployeeOut(id=a.employee.id, name=a.employee.name),
            severity=a.severity,
            category=a.category,
            created_at=a.created_at,
            status=a.status,
        )
        for a in qs
    ]

@api.post("/alerts/{alert_id}/dismiss", response=AlertOut)
def dismiss_alert(request, alert_id: str):
    try:
        a = Alert.objects.select_related("employee").get(id=alert_id)
    except Alert.DoesNotExist:
        raise HttpError(404, "alert not found")

    if a.status != "dismissed":
        a.status = "dismissed"
        a.save(update_fields=["status"])

    return AlertOut(
        id=a.id,
        employee=EmployeeOut(id=a.employee.id, name=a.employee.name),
        severity=a.severity,
        category=a.category,
        created_at=a.created_at,
        status=a.status,
    )
