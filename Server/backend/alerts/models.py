from __future__ import annotations
from django.db import models

class Employee(models.Model):
    id = models.CharField(primary_key=True, max_length=10)
    name = models.CharField(max_length=100)
    reports_to = models.CharField(max_length=10, null=True, blank=True)

class Alert(models.Model):
    id = models.CharField(primary_key=True, max_length=10)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    severity = models.CharField(max_length=10)      # low|medium|high
    category = models.CharField(max_length=50)
    created_at = models.DateTimeField()             # ISO-8601 UTC
    status = models.CharField(max_length=10)        # open|dismissed

    class Meta:
        ordering = ["-created_at", "id"]
