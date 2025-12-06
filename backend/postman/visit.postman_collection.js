{
  "info": {
    "_postman_id": "3b5e2f51-9eb7-4818-a6f2-visitrecords-001",
    "name": "Hospital Management - Visit Records API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Get All Visit Records",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3001/api/visits",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "visits"]
        }
      },
      "response": []
    },
    {
      "name": "2. Get Visit By ID",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3001/api/visits/1",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "visits", "1"]
        }
      },
      "response": []
    },
    {
      "name": "3. Get Visit Records By Patient ID",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3001/api/visits/patient/101",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "visits", "patient", "101"]
        }
      },
      "response": []
    },
    {
      "name": "4. Add Visit Record",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Content-Type", "value": "application/json" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"appointment_id\": 1,\n  \"doctor_id\": 3,\n  \"patient_id\": 101,\n  \"diagnosis\": \"Seasonal flu\",\n  \"notes\": \"Prescribed Vitamin C and rest\",\n  \"next_visit_date\": \"2025-01-20\"\n}"
        },
        "url": {
          "raw": "http://localhost:3001/api/visits",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "visits"]
        }
      },
      "response": []
    },
    {
      "name": "5. Update Visit Record",
      "request": {
        "method": "PUT",
        "header": [
          { "key": "Content-Type", "value": "application/json" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"diagnosis\": \"Updated cold symptoms\",\n  \"notes\": \"Continue Vitamin C\",\n  \"next_visit_date\": \"2025-01-25\"\n}"
        },
        "url": {
          "raw": "http://localhost:3001/api/visits/1",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "visits", "1"]
        }
      },
      "response": []
    },
    {
      "name": "6. Delete Visit Record",
      "request": {
        "method": "DELETE",
        "header": [],
        "url": {
          "raw": "http://localhost:3001/api/visits/1",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "visits", "1"]
        }
      },
      "response": []
    },
    {
      "name": "7. Get Visit Gap (Days Between Visits)",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3001/api/visits/1/gap",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "visits", "1", "gap"]
        }
      },
      "response": []
    }
  ]
}
