# GET :: /api/userAnnotations 
Route to get all user annotations by using email
```
http://localhost:3000/api/userAnnotations?email=vaishnavi@innoasr.com
```
# Response: 
```json
[
  {
    "TASK_ID": "457837",
    "USER_EMAIL": "vaishnavi@innoasr.com",
    "PROJECT": "1033",
    "STATUS": "Not Started",
    "COMMENT_BY_DEVELOPER": null,
    "ASSIGNED_DATE": "2024-07-27 07:31:23.261 -0700",
    "UPDATED_AT": "2024-07-27 07:31:23.261 -0700",
    "REV_ID": null,
    "COMMENT_BY_REVIEWER": null
  },
  {
    "TASK_ID": "457838",
    "USER_EMAIL": "vaishnavi@innoasr.com",
    "PROJECT": "1033",
    "STATUS": "Not Started",
    "COMMENT_BY_DEVELOPER": null,
    "ASSIGNED_DATE": "2024-07-27 07:31:23.261 -0700",
    "UPDATED_AT": "2024-07-27 07:31:23.261 -0700",
    "REV_ID": null,
    "COMMENT_BY_REVIEWER": null
  },
  ...
]
```

# GET :: /api/reviewer

```
http://localhost:3000/api/reviewer?email=aditish@innoasr.com
```
# Response
```json
[
  {
    "TASK_ID": "443392",
    "USER_EMAIL": "vaishnavi@innoasr.com",
    "PROJECT": null,
    "STATUS": "Completed",
    "COMMENT_BY_DEVELOPER": "Okay",
    "COMMENT_BY_REVIEWER": "Invalid",
    "ASSIGNED_DATE": "2024-07-28 21:55:53.334 -0700"
  },
  {
    "TASK_ID": "461786",
    "USER_EMAIL": "vishald@innoasr.com",
    "PROJECT": null,
    "STATUS": "Completed",
    "COMMENT_BY_DEVELOPER": null,
    "COMMENT_BY_REVIEWER": null,
    "ASSIGNED_DATE": "2024-07-28 21:55:53.334 -0700"
  },
  ...
]
``` 