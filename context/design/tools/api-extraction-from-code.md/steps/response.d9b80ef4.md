---
timestamp: 'Tue Oct 21 2025 17:40:20 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_174020.0af434aa.md]]'
content_id: d9b80ef469d1afe501fa4d88fe165629b77a28014967a3a30f60fdbb0689f0d0
---

# response:

You're absolutely right to press on this point, as it goes against common REST API conventions where `GET` is typically used for queries (read-only operations that are idempotent and safe).

The core reason why even queries are `POST` requests in this specification comes directly from the "API Structure Rules" defined at the beginning of the prompt:

* **HTTP Method:** All endpoints use the `POST` method.

This is a **deliberate design choice** within this "Concept Specification" framework, driven by the following considerations:

1. **Unified Interaction Model (RPC-like):** The concept server isn't strictly building a RESTful API in the purest sense (resource-oriented with standard HTTP verbs for CRUD). Instead, it's presenting an **RPC (Remote Procedure Call) style API over HTTP**. In this model, every interaction with a concept is treated like calling a function or method. `POST` is a very common HTTP method for initiating *any* kind of RPC call, regardless of whether it's a read or a write. It signals that an operation is being invoked on the server.

2. **Complex Input Parameters:** Even query functions, like `_getProgression({ progressionId: ProgressionID })`, can have input arguments. If a query needed multiple or complex parameters (e.g., filtering criteria, pagination details, nested objects), sending them via a `GET` request's URL query parameters can become cumbersome, hit URL length limits, or expose sensitive data in logs more easily. By using `POST`, all input arguments (for both actions and queries) are consistently sent in the **request body as a JSON object**. This provides a more flexible and uniform way to pass data.

3. **Consistency and Simplicity for Developers:** By dictating that *all* operations use `POST`, the API simplifies the mental model for client-side developers. They don't need to evaluate whether an operation is a "read" or a "write" to decide on the HTTP verb. Every interaction follows the same pattern: `POST` to `/{conceptName}/{actionOrQueryName}` with a JSON body. This reduces cognitive load and potential for implementation errors.

4. **"Preconditions as Firing Conditions" Apply to Queries Too:** The concept specification explicitly states, "preconditions are firing conditions." Even for queries, the concept has "requires" clauses (e.g., `_getProgression` "requires progressionId is a valid ID of an existing progression"). While `GET` requests can conceptually have preconditions, treating all operations as "invocations" (which `POST` implies) where inputs are validated against "firing conditions" maintains a consistent mental model across the concept's entire public interface.

In summary, while it diverges from classic REST conventions, the use of `POST` for all endpoints, including queries, in this "Concept Server" API is a design decision aimed at **uniformity, simplified parameter passing, and an RPC-like interaction model** consistent with how the concepts define their "actions" and "queries."
