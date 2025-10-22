---
timestamp: 'Tue Oct 21 2025 17:39:46 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_173946.65c66ed2.md]]'
content_id: 65040bc0b0c106bed80f4e81d9956416d6a1afc6b1f14e13231cafa7fcbae08f
---

# response:

This is a great question! The reason all endpoints are specified as `POST` requests is a deliberate design choice outlined in the "API Structure Rules" section of the prompt:

* **HTTP Method:** All endpoints use the `POST` method.

While traditional RESTful APIs often differentiate between `GET` for fetching data (queries) and `POST`/`PUT`/`DELETE` for modifying data (actions), this Concept Specification paradigm adopts a unified approach for several reasons:

1. **"Action-Oriented" Design:** The Concept Specification defines "actions" and "queries" as distinct operations on the concept's state, rather than strictly adhering to resource-oriented REST principles. Even queries (methods starting with `_`) are viewed as specific operations with potentially complex input parameters. `POST` is generally well-suited for any operation that takes input in a request body and performs a defined step.

2. **Consistent Request Body for All Operations:** Both actions and queries in this model take input arguments as a single JSON object in the request body. `POST` is the standard HTTP method for sending data in the request body, making it a natural fit for this consistent input format, regardless of whether the operation is a read or a write. Using `GET` for queries with complex or numerous parameters can lead to unwieldy URLs (due to query string limitations), whereas `POST` avoids this by using the request body.

3. **Simplification and Uniformity:** By enforcing a single HTTP method (`POST`) for all interactions, the API becomes simpler and more uniform for developers. There's no need to decide which HTTP verb to use based on the operation's nature; `POST` is always the answer. This can reduce cognitive load and potential for error in API integration.

4. **Error Handling and State Changes:** Even queries can have "requirements" (preconditions) and return "errors" if those requirements aren't met, much like actions. This blurring of lines between "safe" (GET) and "unsafe" (POST) operations, combined with the focus on state changes and results, makes `POST` a practical choice for a consistent operational model.

In essence, this design prioritizes an explicit, action-like invocation style for all concept operations over strict adherence to traditional RESTful resource management.
