from __future__ import annotations
from datetime import datetime
from ninja import Schema

class EmployeeOut(Schema):
    id: str
    name: str

class AlertOut(Schema):
    id: str
    employee: EmployeeOut
    severity: str
    category: str
    created_at: datetime
    status: str
