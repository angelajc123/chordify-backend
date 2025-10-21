---
timestamp: 'Tue Oct 21 2025 14:27:20 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_142720.f1690f86.md]]'
content_id: 8edf1b9c5d6a7bfb66839b9c2f2384a297354e54b81b5d2abaccb6d297bcabab
---

# API Specification: Labeling Concept

**Purpose:** Organize items by associating them with descriptive labels.

***

## API Endpoints

### POST /api/Labeling/createLabel

**Description:** Creates a new label with a specified name, returning the identifier for the newly created label.

**Requirements:**

* No Label with the given `name` already exists.

**Effects:**

* Creates a new Label `l`.
* Sets the name of `l` to `name`.
* Returns `l` as `label`.

**Request Body:**

```json
{
  "name": "string"
}
```

**Success Response Body (Action):**

```json
{
  "label": "ID"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Labeling/addLabel

**Description:** Associates an item with an existing label.

**Requirements:**

* Not explicitly detailed in the concept specification.

**Effects:**

* Not explicitly detailed in the concept specification.

**Request Body:**

```json
{
  "item": "ID",
  "label": "ID"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Labeling/deleteLabel

**Description:** Removes the association between an item and a label.

**Requirements:**

* Not explicitly detailed in the concept specification.

**Effects:**

* Not explicitly detailed in the concept specification.

**Request Body:**

```json
{
  "item": "ID",
  "label": "ID"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***
