# ProgressionBuilder Design Changes
[@previous-concept](../../../context/design/concepts/ProgressionBuilder/concept.md/steps/concept.a792d8a5.md)  
[@updated-concept](../../../context/design/concepts/ProgressionBuilder/concept.md/steps/concept.0e25b4ee.md)
- Changed `musical unit` to `chord` for clarity
- Defined all of the types
- Allow the user to create multiple progressions. I thought the scope of the project was a little narrow without this functionality, and was thinking more about persistence between user sessions, and thought it would be better for consistency.
- Added a `reorderSlots` method. This is funcitonality that I would want as a user.
- Instead of having `selectedSlot` be a field in the state, I changed position to be passed in as a variable. I think this will work nicer with the front-end back-end logic separation