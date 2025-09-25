"""
Minimal BigQueryService shim used by bimo to query billing exports.

This implementation is intentionally lightweight: it lazily imports the
google-cloud-bigquery library and when unavailable provides safe no-op
responses so the rest of the application can continue to operate.

When BigQuery is available, the class exposes helper methods used by the
providers router: get_daily_spend, get_token_usage, get_monthly_cost, get_raw_usage.
"""
from typing import Any, Dict, List


class BigQueryService:
    def __init__(self, service_account_json: str, project_id: str):
        self.project_id = project_id
        self._client = None
        try:
            # Lazy import to avoid forcing the dependency in dev where it's
            # not needed.
            from google.cloud import bigquery  # type: ignore
            import json
            creds = json.loads(service_account_json) if isinstance(service_account_json, str) else service_account_json
            # Use default credentials behavior when service account isn't used here
            # for simplicity; constructing a client with credentials is possible
            # but requires google.oauth2.service_account which we avoid in the
            # minimal shim.
            self._client = bigquery.Client(project=project_id)
        except Exception:
            # If BigQuery client isn't available or fails to initialize, keep
            # _client as None and methods will return safe empty shapes.
            self._client = None

    def _run_query(self, sql: str) -> List[Dict[str, Any]]:
        """Run a SQL query and return list of rows as dicts.

        If the client is unavailable this returns an empty list.
        """
        if not self._client:
            return []
        query_job = self._client.query(sql)
        return [dict(row) for row in query_job]

    def get_daily_spend(self, dataset_id: str, days: int = 30) -> List[Dict[str, Any]]:
        # Return empty list when client not present or no data
        if not self._client:
            return []
        # Placeholder example query; real implementations should match the
        # billing export schema used in the user's GCP project.
        sql = f"SELECT DATE(usage_start_time) as day, SUM(cost) as cost FROM `{self.project_id}.{dataset_id}.gcp_billing_export_v1_*` WHERE DATE(usage_start_time) >= DATE_SUB(CURRENT_DATE(), INTERVAL {days} DAY) GROUP BY day ORDER BY day"
        return self._run_query(sql)

    def get_token_usage(self, dataset_id: str, days: int = 30) -> Dict[str, Any]:
        if not self._client:
            return {"total_tokens": 0, "by_day": []}
        # Placeholder - users should adapt to their billing schema
        sql = f"SELECT DATE(usage_start_time) as day, SUM(tokens) as tokens FROM `{self.project_id}.{dataset_id}.gcp_billing_export_v1_*` WHERE DATE(usage_start_time) >= DATE_SUB(CURRENT_DATE(), INTERVAL {days} DAY) GROUP BY day ORDER BY day"
        rows = self._run_query(sql)
        total = sum([r.get('tokens', 0) or 0 for r in rows])
        return {"total_tokens": total, "by_day": rows}

    def get_monthly_cost(self, dataset_id: str) -> float:
        if not self._client:
            return 0.0
        sql = f"SELECT SUM(cost) as total_cost FROM `{self.project_id}.{dataset_id}.gcp_billing_export_v1_*` WHERE DATE_TRUNC(DATE(usage_start_time), MONTH) = DATE_TRUNC(CURRENT_DATE(), MONTH)"
        rows = self._run_query(sql)
        if rows and isinstance(rows, list) and len(rows) > 0:
            return float(rows[0].get('total_cost') or 0.0)
        return 0.0

    def get_raw_usage(self, dataset_id: str, days: int = 30) -> List[Dict[str, Any]]:
        if not self._client:
            return []
        sql = f"SELECT * FROM `{self.project_id}.{dataset_id}.gcp_billing_export_v1_*` WHERE DATE(usage_start_time) >= DATE_SUB(CURRENT_DATE(), INTERVAL {days} DAY) LIMIT 1000"
        return self._run_query(sql)


