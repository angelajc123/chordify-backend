---
timestamp: 'Mon Nov 03 2025 16:29:12 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251103_162912.51ca93d3.md]]'
content_id: d1af4a54062cc68032f29024aacae780d4c284113d4ac3fe59a8725c7502a8f6
---

# response:

This is an excellent question that gets to the heart of designing an application with this synchronization paradigm. The core idea is to think about **events** and **reactions**.

## What Routes Should I Include/Exclude?

Routes in this context primarily refer to your application's **public API endpoints** that a client (frontend, mobile app, another service) would call.

**Include Routes For:**

1. **User-Initiated Actions:** Any operation that a user directly triggers through a UI or API call. These typically map to `Requesting.request` actions.

   * **CRUD Operations:** Creating, reading, updating, or deleting entities (e.g., `/posts`, `/users/{id}`, `/comments`).
   * **Specific Business Logic Operations:** Actions that don't fit a simple CRUD, but are a distinct user command (e.g., `/login`, `/logout`, `/upload-file`, `/like-post`, `/purchase-item`, `/LikertSurvey/addQuestion` from your example).
   * **Data Retrieval/Reporting:** Endpoints designed to fetch specific data sets or aggregated information (e.g., `/my-files`, `/purchase-totals`).

   **Example `Requesting.request` patterns:**

   * `Requesting.request (path: "/posts", method: "POST", body: { title, content }) : (request)`
   * `Requesting.request (path: "/posts/{id}", method: "GET") : (request)`
   * `Requesting.request (path: "/LikertSurvey/addQuestion", survey, text) : (request)`

**Exclude Routes For:**

1. **Internal Concept Actions/Queries:** You **do not** create routes for every `Concept.action` or `Concept._query` directly. These are the building blocks that your synchronizations use internally. The routes are the *entry points* that trigger chains of these internal actions/queries.
   * For example, you wouldn't have a direct route `/LikertSurvey/addQuestionConceptAction` that just calls `LikertSurvey.addQuestion`. Instead, the `Requesting.request` route `/LikertSurvey/addQuestion` *triggers* the sync that calls `LikertSurvey.addQuestion`.
2. **Background Processes / Scheduled Tasks:** If your application has background jobs, data cleanup, or scheduled tasks, these are typically not exposed as HTTP routes. They would be initiated by other means (e.g., a cron job, an internal event system) and then utilize synchronizations to perform their work.
3. **Intermediate Steps in a Workflow:** If a client initiates a complex workflow, you typically expose the *start* and perhaps *major milestones* as routes, but not every tiny step within the workflow that is orchestrated by your synchronizations.
4. **Error Handling (Internal):** While you might have a generic `/error` route for clients to get error pages, you don't typically expose routes for every internal error condition (e.g., `/database-connection-failed`). These are handled internally by error-matching synchronizations.

**In essence:** Routes define the **external interface** of your application. Synchronizations define the **internal logic and behavior** that responds to and fulfills those external requests (and other internal events).

## What Syncs Should I Have?

Synchronizations are the **declarative business logic** of your application. They describe the cause-and-effect relationships between different concept actions and queries. Think of them as defining "if this happens, then these things should happen, potentially after checking these conditions."

Here's a breakdown of common types of synchronizations you'll need:

1. **Request-to-Action Syncs (The Entry Points):**
   * **Purpose:** To translate an incoming HTTP request (matched by `Requesting.request`) into the initial concept action(s) that process that request.
   * **Pattern:** `when: Requesting.request(...) then: Concept.action(...)`
   * **Example:** Your `AddQuestionRequest` example.
     ```typescript
     // When a request to add a question comes in, call the concept action
     export const AddQuestionRequest: Sync = ({ request, survey, text }) => ({
       when: actions([
         Requesting.request,
         { path: "/LikertSurvey/addQuestion", survey, text },
         { request },
       ]),
       then: actions([LikertSurvey.addQuestion, { survey, text }]),
     });
     ```

2. **Action-to-Response Syncs (Closing the Loop):**
   * **Purpose:** To send an HTTP response back to the client after a concept action (or sequence of actions) has completed successfully or with an error. These usually tie back to an original `Requesting.request` in the same `flow`.
   * **Pattern (Success):** `when: Requesting.request(...) AND Concept.action(...) (success output) then: Requesting.respond(...)`
   * **Pattern (Error):** `when: Requesting.request(...) AND Concept.action(...) (error output) then: Requesting.respond(...)`
   * **Example:** Your `AddQuestionResponse` and `AddQuestionResponseError` examples.
     ```typescript
     // When an addQuestion request leads to a successful addQuestion concept action, respond with the question
     export const AddQuestionResponse: Sync = ({ request, question }) => ({
       when: actions(
         [Requesting.request, { path: "/LikertSurvey/addQuestion" }, { request }],
         [LikertSurvey.addQuestion, {}, { question }], // Matches success output
       ),
       then: actions([Requesting.respond, { request, question }]),
     });

     // When an addQuestion request leads to a failed addQuestion concept action, respond with the error
     export const AddQuestionResponseError: Sync = ({ request, error }) => ({
       when: actions(
         [Requesting.request, { path: "/LikertSurvey/addQuestion" }, { request }],
         [LikertSurvey.addQuestion, {}, { error }], // Matches error output
       ),
       then: actions([Requesting.respond, { request, error }]),
     });
     ```

3. **Business Logic / Chained Action Syncs:**
   * **Purpose:** To implement the core rules of your application, where one concept action triggers others, potentially with conditions or queries.
   * **Pattern:** `when: ConceptA.action(...) [where: conditions/queries] then: ConceptB.action(...)`
   * **Example:** Your `PostCommentDeletion` example.
     ```typescript
     // When a post is deleted, find all comments for that post and delete them
     export const PostCommentDeletion: Sync = ({ post, comment, request }) => ({
       when: actions(
         [Requesting.request, { path: "/posts/delete", post }, { request }], // Assuming this is part of the flow that deletes the post
         [Post.delete, { post }, { post }], // The post has been deleted
       ),
       where: async (frames) => {
         // Query for all comments associated with the deleted post
         return await frames.query(Comment._getByTarget, { target: post }, { comment });
       },
       then: actions(
         [Comment.delete, { comment }], // Delete each found comment
       ),
     });
     ```
   * **Example with State Query:** Your `NotifyWhenReachTen` example.
     ```typescript
     // When a counter is incremented, if count > 10, send a notification
     export const NotifyWhenReachTen: Sync = ({ count, user }) => ({
         when: actions(
             [Button.clicked, { kind: "increment_counter", user }, {}],
             [Counter.increment, {}, {}],
         ),
         where: async (frames) => {
             frames = await frames.query(Counter._getCount, {}, { count })
             return frames.filter(($) => $[count] >= 10);
         },
         then: actions(
             [Notification.notify, { message: "Reached 10", to: user }],
         ),
     });
     ```

4. **Data Aggregation / Transformation Syncs:**
   * **Purpose:** To collect and process data from multiple sources or frames, often for returning to a client. Uses `where` clauses extensively with queries and `collectAs`.
   * **Pattern:** `when: Requesting.request(...) where: multiple queries + collectAs then: Requesting.respond(...)`
   * **Example:** Your `GetActiveUserPurchaseTotals` example.
     ```typescript
     // When a request for purchase totals comes in, gather user info and their totals
     export const GetActiveUserPurchaseTotals: Sync = (
       { request, user, username, total, results },
     ) => ({
       when: actions(
         [Requesting.request, { path: "/purchase-totals" }, { request }],
       ),
       where: async (frames) => {
         frames = await frames.query(User._getActiveUsers, {}, { user });
         frames = await frames.query(User._getUsername, { user }, { username });
         frames = await frames.query(Purchasing._getTotalForUser, { user }, { total });
         return frames.collectAs([user, username, total], results); // Aggregate results
       },
       then: actions(
         [Requesting.respond, { request, results }],
       ),
     });
     ```
   * **Handling Zero Matches (Important Pitfall):** Don't forget the pattern described for when queries might return an empty set of frames, leading to no response.

**General Guidelines for Syncs:**

* **One Responsibility:** Ideally, each sync should have a clear, single purpose. This makes them easier to understand, test, and debug.
* **Declarative, Not Imperative:** Focus on *what* should happen, not necessarily *how* to do it step-by-step. The engine handles the execution flow.
* **Identify Causal Relationships:** Look for "when this happens, then that should happen." This is the core mental model for designing syncs.
* **Map Business Rules:** Every business rule ("users can only delete their own posts," "a notification is sent if a critical event occurs") should ideally map to one or more synchronizations.
* **Think in Terms of Events and State:**
  * **Events:** `when` clauses listen for these (concept actions, requests).
  * **State:** `where` clauses query and filter based on the current state (concept data).
  * **Reactions:** `then` clauses trigger these (concept actions, responses).

By approaching your application design with these guidelines, you can effectively structure your routes to expose your API and use synchronizations to declaratively implement all your application's logic.
