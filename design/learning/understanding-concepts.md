[@concept-design-overview](../background/concept-design-overview.md)

# question: how do I design concepts?
# response:

Based on the provided text, designing concepts involves a systematic approach focused on **modularity, independence, user-facing functionality, and well-defined boundaries**. Here's a breakdown of how to design concepts:

### Core Principles for Designing Concepts:

1.  **Identify User-Facing, Coherent Units of Functionality:**
    *   **Focus on Purpose:** Start by asking: What specific, intelligible purpose does a piece of functionality serve for the user? (e.g., "to rank items by popularity" for `Upvote`, "to manage restaurant bookings" for `RestaurantReservation`).
    *   **User-Centric:** Each concept must be a "reusable unit of user-facing functionality." Think about the actions users perform and the value they get.
    *   **Archetypal Nature:** Look for behaviors that are common and recognizable across different applications. Can this function be used in a new setting with the user already understanding it?

2.  **Ensure Strict Separation of Concerns:**
    *   **Single Responsibility:** Each concept should address "only a single, coherent aspect of the functionality."
    *   **De-conflate:** Actively break apart combined functionalities. The prime example is the `User` class in traditional design:
        *   Instead of a monolithic `User` concept, create separate concepts like:
            *   `UserAuthentication` (handles usernames, passwords, identity mapping).
            *   `Profile` (handles bios, thumbnail images, user-specific data not related to authentication).
            *   `Notification` (handles communication channels like phone numbers, email addresses).
            *   `Karma` (if applicable, handles reputation points).
    *   **Concept-Owned State:** Each concept should maintain only the state relevant to *its* specific concern. For `Upvote`, it's the relationship between items and users who voted, *not* the user's name or bio.

3.  **Design for Independence (The Most Crucial Aspect):**
    *   **No Direct References/Dependencies:** This is paramount. A concept "is defined without reference to any other concepts, and can be understood in isolation." It cannot import, call, or directly use services from another concept.
    *   **Polymorphism for Generality:** Make concepts as generic as possible. If `Comment` is used for posts, describe it as applying comments to "arbitrary targets," defined only by an identity. This prevents coupling and promotes reuse.
    *   **Self-Contained:** The behavior and state of a concept must be entirely self-contained within that concept.

4.  **Define a Minimal but Sufficient State:**
    *   **Own its State:** Each concept "maintains its own state." This state must be persisted (e.g., in a database) as part of the backend service.
    *   **Sufficiency:** The state "must be sufficiently rich to support the concept’s behavior" (e.g., `Upvote` needs user IDs to prevent double voting).
    *   **Minimality:** The state "should be no richer than it need be" (e.g., `Upvote` doesn't need a user's name, just their ID). This ties back to separation of concerns.

5.  **Define Clear, Atomic Actions (API & Protocol):**
    *   **User and Concept Interaction:** Concepts "interact with the user (and with other concepts) through atomic actions."
    *   **Human Protocol:** Think of these actions as a "human behavioral protocol." What are the steps a user (or another concept) would take?
        *   `RestaurantReservation`: `reserve`, `cancel`, `seat`.
        *   `Post`: `create`, `delete`, `edit`.
        *   `Upvote`: `upvote`, `downvote`.
    *   **API Specification:** Each action will correspond to an API function/endpoint for developers.

6.  **Ensure Completeness of Functionality:**
    *   **No Delegation to Other Concepts:** A concept must fully deliver its stated functionality. If a `Notification` concept has an action to notify a user, *it* must handle the actual delivery (e.g., sending an email or text), not rely on calling an external `Emailing` or `TextMessaging` concept. These would be considered part of the `Notification` concept's complete scope.

### The Design Process (Implicit in the Text):

1.  **Brainstorm Application Functionality:** List all user-facing features and behaviors of your application.
2.  **Decompose into Potential Concepts:** For each feature, try to identify the smallest, most coherent, and reusable unit. Ask yourself:
    *   Does this serve a single, clear purpose?
    *   Can a user understand this independently?
    *   Is this behavior common across many applications?
    *   Can I separate any part of this into a different concern (e.g., authentication vs. profile)?
3.  **Define Each Concept Individually:** For each identified concept:
    *   **Purpose:** Clearly articulate its "well-defined and intelligible purpose."
    *   **State:** Determine the minimal set of entities and relationships it needs to maintain to fulfill its purpose. Remember, no state that belongs to another concern.
    *   **Actions:** List all atomic user-facing and spontaneous actions it performs. These will form its API.
    *   **Completeness Check:** Can this concept fully deliver its function without calling out to *any other concept*? If not, either its scope is too broad, or you need to re-evaluate what "complete" means for this concept.
    *   **Independence Check:** Does this concept assume anything specific about other parts of the application or other concepts? If so, try to generalize its arguments or scope.
4.  **Do NOT Design Interactions at this Stage:** Resist the urge to think about how concepts talk to each other. Focus purely on each concept in isolation.
5.  **Design Synchronizations (Syncs) Separately:** Once all concepts are defined and independent, you then design the `sync` rules to connect them, allowing them to cooperate to achieve the overall application's functionality. This is where the application-specific logic lives.

By adhering to these principles, particularly **independence, separation of concerns, and completeness**, you'll create a system composed of robust, reusable, and easily understandable concepts.