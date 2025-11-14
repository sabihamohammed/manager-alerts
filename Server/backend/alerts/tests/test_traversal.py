import pytest
from alerts.api import traverse_subtree

@pytest.mark.django_db
def test_subtree_cycle_prevention():
    assert set(traverse_subtree("E7")) == {"E6", "E8"}
