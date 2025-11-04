---
timestamp: 'Mon Nov 03 2025 16:31:31 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251103_163131.f9040dd4.md]]'
content_id: 9e86d29be00d318efa21b49d6c833f683892febc1443dfa23ea69c2b37f786a8
---

# response:

Based on your concept specifications and the provided framework, here's a structured approach to determining what routes and synchronizations you should include:

The core idea is to map your application's expected interactions (both UI and API) to the `when`, `where`, and `then` clauses of your synchronizations.

## General Strategy for Routes and Synchronizations

1. **Identify your application's "use cases" or "features."** These often align with your concepts (e.g., "manage surveys," "manage posts," "user authentication").
2. **For each use case, identify the "entry points."**
   * **External API Requests:** These almost always start with `Requesting.request`. Each unique API endpoint (`path`) will typically be an entry point.
   * **Internal UI Events:** These will be actions like `Button.clicked`, `Form.submitted`, etc.
3. **Design API Routes:** For each `Requesting.request` entry point, define a clear HTTP method and path. The parameters expected by your `Requesting.request` action (e.g., `survey`, `text`) become your request body/query parameters.
4. **Implement Synchronizations:** For each entry point, you'll generally need one or more synchronizations:
   * **Request/Event Trigger Sync:** Catches the initial `when` event and triggers the core business logic concept action in `then`.
   * **Success Response Sync:** Catches the initial `when` event *and* the successful completion of the business logic concept action, then uses `Requesting.respond` (for API) or triggers a UI update (for internal events).
   * **Error Response Sync (Recommended):** Catches the initial `when` event *and* the failed completion (an `error` output) of the business logic concept action, then uses `Requesting.respond` with an error.
   * **Intermediary Logic/Side Effects:** Other syncs that chain off concept actions (e.g., "when `Post.delete`, then `Comment.delete`").
5. **Utilize `where` clauses for:**
   * Fetching additional state needed for logic (`frames.query`).
   * Applying conditions/filters (`frames.filter`).
   * Aggregating or transforming data (`frames.collectAs`, `frames.map`).
   * Handling edge cases like "zero matches" for queries that might return empty results.

***

## Example Mapping: From Concepts to Routes and Syncs

Let's use the concepts mentioned in your examples: `Button`, `Counter`, `Notification`, `Requesting`, `LikertSurvey`, `Post`, `Comment`, `User`, `Sessioning`, `FileUploading`, `Purchasing`, `Sharing`.

### 1. Likert Survey Management

**Assumed Concept Specifications:**

```concept
concept LikertSurvey
actions
	createSurvey (author: User, title: string, scaleMin: number, scaleMax: number) : (survey: LikertSurvey | Error)
	addQuestion (survey: LikertSurvey, text: string) : (question: Question | Error)
queries
	_getQuestionsBySurvey (survey: LikertSurvey) : (question: Question) // Returns an array of Questions
```

**Proposed API Routes:**

* `POST /surveys`: Create a new Likert Survey.
* `POST /surveys/:surveyId/questions`: Add a question to a specific survey.
* `GET /surveys/:surveyId/questions`: Get all questions for a specific survey.

**Proposed Synchronizations (`.sync.ts` files):**

```typescript
// src/syncs/likertSurvey/createSurvey.sync.ts
import { actions, Sync, Frames } from "@engine";
import { Requesting, LikertSurvey, Sessioning, User } from "@concepts";

// 1. Handle incoming request to create a survey
export const CreateSurveyRequest: Sync = ({ request, session, author, title, scaleMin, scaleMax, user }) => ({
    when: actions([
        Requesting.request,
        { path: "/surveys", session, title, scaleMin, scaleMax },
        { request },
    ]),
    where: async (frames) => {
        // Look up the user ID from the session to set as author
        frames = await frames.query(Sessioning._getUser, { session }, { user });
        // Map 'user' variable to 'author' parameter for LikertSurvey.createSurvey
        return frames.map(($) => ({ ...$, [author]: $[user] }));
    },
    then: actions([LikertSurvey.createSurvey, { author, title, scaleMin, scaleMax }]),
});

// 2. Respond to successful survey creation
export const CreateSurveyResponse: Sync = ({ request, survey }) => ({
    when: actions(
        [Requesting.request, { path: "/surveys" }, { request }],
        [LikertSurvey.createSurvey, {}, { survey }], // Matches successful output
    ),
    then: actions([Requesting.respond, { request, survey }]),
});

// 3. Respond to error during survey creation
export const CreateSurveyResponseError: Sync = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/surveys" }, { request }],
        [LikertSurvey.createSurvey, {}, { error }], // Matches error output
    ),
    then: actions([Requesting.respond, { request, error }]),
});

// --- Other LikertSurvey Syncs (as in your example) ---

// src/syncs/likertSurvey/addQuestion.sync.ts
export const AddQuestionRequest: Sync = ({ request, survey, text }) => ({
  when: actions([
    Requesting.request,
    { path: "/surveys/:surveyId/questions", survey, text }, // Assuming surveyId maps to 'survey' param
    { request },
  ]),
  then: actions([LikertSurvey.addQuestion, { survey, text }]),
});

// src/syncs/likertSurvey/addQuestionResponse.sync.ts
export const AddQuestionResponse: Sync = ({ request, question }) => ({
  when: actions(
    [Requesting.request, { path: "/surveys/:surveyId/questions" }, { request }],
    [LikertSurvey.addQuestion, {}, { question }],
  ),
  then: actions([Requesting.respond, { request, question }]),
});

// src/syncs/likertSurvey/addQuestionResponseError.sync.ts
export const AddQuestionResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/surveys/:surveyId/questions" }, { request }],
    [LikertSurvey.addQuestion, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// src/syncs/likertSurvey/listSurveyQuestions.sync.ts
export const ListSurveyQuestions: Sync = ({ request, surveyId, question, questions }) => ({
    when: actions([
        Requesting.request,
        { path: "/surveys/:surveyId/questions", surveyId },
        { request },
    ]),
    where: async (frames) => {
        const originalFrame = frames[0];
        frames = await frames.query(LikertSurvey._getQuestionsBySurvey, { survey: surveyId }, { question });

        if (frames.length === 0) {
            // Return an empty array if no questions found (handle zero matches)
            const response = { ...originalFrame, [questions]: [] };
            return new Frames(response);
        }
        return frames.collectAs([question], questions);
    },
    then: actions([Requesting.respond, { request, questions }]),
});
```

### 2. Post and Comment Management

**Assumed Concept Specifications:**

```concept
concept Post
actions
	createPost (author: User, title: string, content: string) : (post: Post | Error)
	delete (post: Post) : (Post | Error)
queries
    _getPostById (postId: ID) : (post: Post)
```

```concept
concept Comment [Target]
actions
	addComment (target: Target, author: User, content: string) : (comment: Comment | Error)
	delete (comment: Comment) : (Comment | Error)
queries
	_getByTarget (target: Target) : (comment: Comment) // Returns array of Comments
```

**Proposed API Routes:**

* `POST /posts`: Create a new post.
* `DELETE /posts/:postId`: Delete a post (and its comments).
* `POST /posts/:postId/comments`: Add a comment to a specific post.
* `GET /posts/:postId`: Get a specific post's details.
* `GET /posts/:postId/comments`: Get all comments for a specific post.

**Proposed Synchronizations:**

```typescript
// src/syncs/post/createPost.sync.ts
import { actions, Sync, Frames } from "@engine";
import { Requesting, Post, Sessioning } from "@concepts";

export const CreatePostRequest: Sync = ({ request, session, title, content, author, user }) => ({
    when: actions([
        Requesting.request,
        { path: "/posts", session, title, content },
        { request },
    ]),
    where: async (frames) => {
        // Get user from session
        frames = await frames.query(Sessioning._getUser, { session }, { user });
        return frames.map(($) => ({ ...$, [author]: $[user] })); // Map user to author
    },
    then: actions([Post.createPost, { author, title, content }]),
});

export const CreatePostResponse: Sync = ({ request, post }) => ({
    when: actions(
        [Requesting.request, { path: "/posts" }, { request }],
        [Post.createPost, {}, { post }],
    ),
    then: actions([Requesting.respond, { request, post }]),
});

export const CreatePostResponseError: Sync = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/posts" }, { request }],
        [Post.createPost, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});


// src/syncs/post/deletePost.sync.ts (includes cascading delete)
import { actions, Sync, Frames } from "@engine";
import { Requesting, Post, Comment } from "@concepts";

export const DeletePostRequest: Sync = ({ request, postId, post }) => ({
    when: actions([
        Requesting.request,
        { path: "/posts/:postId", postId },
        { request },
    ]),
    then: actions([Post.delete, { post: postId }]),
});

export const PostCommentDeletion: Sync = ({ post, comment }) => ({
    when: actions(
        [Post.delete, { post }, {}], // Trigger when a post is deleted
    ),
    where: async (frames) => {
        // Find all comments for the deleted post
        return await frames.query(Comment._getByTarget, { target: post }, { comment });
    },
    then: actions(
        [Comment.delete, { comment }], // Delete each comment
    ),
});

export const DeletePostResponse: Sync = ({ request, postId }) => ({
    when: actions(
        [Requesting.request, { path: "/posts/:postId", postId }, { request }],
        [Post.delete, { post: postId }, {}], // Post deletion completed
    ),
    then: actions([Requesting.respond, { request, status: "Post and associated comments deleted" }]),
});

export const DeletePostResponseError: Sync = ({ request, postId, error }) => ({
    when: actions(
        [Requesting.request, { path: "/posts/:postId", postId }, { request }],
        [Post.delete, { post: postId }, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});

// src/syncs/comment/addComment.sync.ts
import { actions, Sync } from "@engine";
import { Requesting, Comment, Sessioning } from "@concepts";

export const AddCommentRequest: Sync = ({ request, postId, content, session, author, user }) => ({
    when: actions([
        Requesting.request,
        { path: "/posts/:postId/comments", postId, content, session },
        { request },
    ]),
    where: async (frames) => {
        frames = await frames.query(Sessioning._getUser, { session }, { user });
        return frames.map(($) => ({ ...$, [author]: $[user] })); // Map user to author
    },
    then: actions([Comment.addComment, { target: postId, author, content }]),
});

export const AddCommentResponse: Sync = ({ request, comment }) => ({
    when: actions(
        [Requesting.request, { path: "/posts/:postId/comments" }, { request }],
        [Comment.addComment, {}, { comment }],
    ),
    then: actions([Requesting.respond, { request, comment }]),
});

export const AddCommentResponseError: Sync = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/posts/:postId/comments" }, { request }],
        [Comment.addComment, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});


// src/syncs/post/getPostDetails.sync.ts
export const GetPostDetails: Sync = ({ request, postId, post }) => ({
    when: actions([
        Requesting.request,
        { path: "/posts/:postId", postId },
        { request }
    ]),
    where: async (frames) => {
        const originalFrame = frames[0];
        frames = await frames.query(Post._getPostById, { postId }, { post });
        if (frames.length === 0) {
            return new Frames({...originalFrame, error: "Post not found" });
        }
        return frames;
    },
    then: actions([
        Requesting.respond, { request, post }
    ])
});

export const GetPostDetailsError: Sync = ({ request, error }) => ({
    when: actions([
        Requesting.request,
        { path: "/posts/:postId" },
        { request }
    ]),
    where: (frames) => {
        // This 'where' acts as a guard for the error case from GetPostDetails
        return frames.filter(($) => $[error] !== undefined);
    },
    then: actions([
        Requesting.respond, { request, status: 404, error }
    ])
});

// src/syncs/comment/listPostComments.sync.ts
export const ListPostComments: Sync = ({ request, postId, comment, comments }) => ({
    when: actions([
        Requesting.request,
        { path: "/posts/:postId/comments", postId },
        { request },
    ]),
    where: async (frames) => {
        const originalFrame = frames[0];
        frames = await frames.query(Comment._getByTarget, { target: postId }, { comment });
        if (frames.length === 0) {
            const response = { ...originalFrame, [comments]: [] };
            return new Frames(response);
        }
        return frames.collectAs([comment], comments);
    },
    then: actions([Requesting.respond, { request, comments }]),
});
```

### 3. User & Session Management

**Assumed Concept Specifications:**

```concept
concept Sessioning
queries
	_getUser (session: ID) : (user: User)
	_isLoggedIn (session: ID) : (boolean) // Or just check if _getUser returns a user
```

```concept
concept User
queries
	_getUsername (user: ID) : (username: string)
	_getActiveUsers () : (user: User, username: string)
```

**Proposed API Routes:**

* `GET /me`: Get details of the current logged-in user.
* `GET /users/active`: Get a list of all active users.

**Proposed Synchronizations:**

```typescript
// src/syncs/user/getCurrentUser.sync.ts
import { actions, Sync, Frames } from "@engine";
import { Requesting, Sessioning, User } from "@concepts";

export const GetCurrentUserRequest: Sync = ({ request, session, user, username }) => ({
    when: actions([
        Requesting.request,
        { path: "/me", session },
        { request },
    ]),
    where: async (frames) => {
        const originalFrame = frames[0];
        frames = await frames.query(Sessioning._getUser, { session }, { user });

        if (frames.length === 0) {
            // Not logged in, create a frame to respond with an error
            return new Frames({ ...originalFrame, error: "Not Authenticated" });
        }
        // If logged in, get username
        frames = await frames.query(User._getUsername, { user }, { username });
        return frames;
    },
    then: actions(
        // Conditional response based on 'error' binding
        [Requesting.respond, { request, status: 401, error }], // Will fire if 'error' is bound
        [Requesting.respond, { request, user, username }], // Will fire if 'user' and 'username' are bound
    ),
});

// src/syncs/user/getActiveUsers.sync.ts
export const GetActiveUsers: Sync = ({ request, user, username, results }) => ({
    when: actions([
        Requesting.request,
        { path: "/users/active" },
        { request },
    ]),
    where: async (frames) => {
        const originalFrame = frames[0];
        frames = await frames.query(User._getActiveUsers, {}, { user, username });

        if (frames.length === 0) {
            return new Frames({ ...originalFrame, [results]: [] });
        }
        return frames.collectAs([user, username], results);
    },
    then: actions([Requesting.respond, { request, results }]),
});
```

### 4. File Management

**Assumed Concept Specifications:**

```concept
concept FileUploading
queries
	_getFilesByOwner (owner: User) : (file: File, filename: string)
```

**Proposed API Routes:**

* `GET /my-files`: List files owned by the current user.

**Proposed Synchronizations:**

```typescript
// src/syncs/file/listMyFiles.sync.ts (your example, good for zero matches)
import { actions, Frames, Sync } from "@engine";
import { Requesting, Sessioning, FileUploading } from "@concepts";

export const ListMyFilesRequest: Sync = ({ request, session, user, file, filename, results }) => ({
    when: actions([Requesting.request, { path: "/my-files", session }, { request }]),
    where: async (frames) => {
        const originalFrame = frames[0];
        frames = await frames.query(Sessioning._getUser, { session }, { user });
        frames = await frames.query(FileUploading._getFilesByOwner, { owner: user }, { file, filename });

        if (frames.length === 0) {
            const response = { ...originalFrame, [results]: [] };
            return new Frames(response);
        }
        return frames.collectAs([file, filename], results);
    },
    then: actions([Requesting.respond, { request, results }]),
});
```

***

## What to Exclude / Common Pitfalls Revisited

* **Avoid complex logic *outside* `frames.query`, `filter`, `map`, `collectAs` in `where`:** Your `where` clause should primarily be a pipeline of `Frames` operations. If you find yourself writing complex `if/else` or loops that don't fit the `Frames` API, consider if that logic belongs inside a concept's query or action.
* **Don't directly instantiate or manage data sources:** Your synchronizations should never directly interact with databases, file systems, or external APIs using `fetch`, `axios`, etc. All such interactions should be encapsulated within your concept implementations.
* **Keep `then` clauses lean:** `then` clauses should ideally just list the actions to be fired, with their parameters bound from the `when` and `where` phases. Complex object construction for responses should happen in `where`.
* **Pathing conventions:** Decide on a consistent API pathing convention (e.g., `/resource` for collections, `/resource/:id` for specific items, `/resource/:id/subresource` for nested resources).
* **Authentication/Authorization:** This is usually handled in the `where` clause. For example, checking `Sessioning._isLoggedIn` or `Sessioning._getUser` and then filtering frames or returning an error if unauthorized.

By systematically going through your concepts and applying these patterns, you can build a comprehensive and maintainable set of synchronizations that accurately reflect your application's behavior. Remember to run `deno run build` whenever you change your concept definitions to update the `@concepts` import.
