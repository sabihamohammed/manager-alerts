from django.core.management.base import BaseCommand
from alerts.models import Employee, Alert
from django.utils.dateparse import parse_datetime
import json
from pathlib import Path

class Command(BaseCommand):
    help = "Load seed data into DB"

    def handle(self, *args, **kwargs):
        seed_file = Path(__file__).resolve().parent.parent.parent / "seed_data.json"
        data = json.loads(seed_file.read_text())

        Employee.objects.all().delete()
        Alert.objects.all().delete()

        emp_map = {}

        for e in data["employees"]:
            emp = Employee.objects.create(**e)
            emp_map[e["id"]] = emp

        for a in data["alerts"]:
            Alert.objects.create(
                id=a["id"],
                employee=emp_map[a["employee_id"]],
                severity=a["severity"],
                category=a["category"],
                created_at=parse_datetime(a["created_at"]),
                status=a["status"],
            )

        self.stdout.write(self.style.SUCCESS("Seed data loaded"))
