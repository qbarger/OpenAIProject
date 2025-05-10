# Dating App Zero-Shot Results

## Database Schema

```sql
create table person (
    person_id int primary key,
    firstname varchar(30) not null,
    lastname varchar(30) not null,
    birthdate date not null,
    gender TEXT CHECK (gender IN ('m', 'f')) NOT NULL,
    bio text
);

create table address (
    address_id int primary key,
    street varchar(50) not null,
    city varchar(30) not null,
    state char(2) not null,
    zip_code varchar(10) not null,
    latitude real,
    longitude real
);

create table location (
    person_id INTEGER PRIMARY KEY,
    address_id INTEGER not null,
    FOREIGN KEY (person_id) REFERENCES person(person_id),
    FOREIGN KEY (address_id) REFERENCES address(address_id)
);

CREATE TABLE interest (
    interest_id INTEGER PRIMARY KEY,
    name VARCHAR(50) UNIQUE
);

CREATE TABLE person_interest (
    person_id INTEGER,
    interest_id INTEGER,
    PRIMARY KEY (person_id, interest_id),
    FOREIGN KEY (person_id) REFERENCES person(person_id),
    FOREIGN KEY (interest_id) REFERENCES interest(interest_id)
);

CREATE TABLE match (
    match_id INTEGER PRIMARY KEY,
    person_id_1 INTEGER,
    person_id_2 INTEGER,
    matched_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id_1) REFERENCES person(person_id),
    FOREIGN KEY (person_id_2) REFERENCES person(person_id),
    CHECK (person_id_1 < person_id_2)
);

create table feed (
    feed_id INTEGER primary key AUTOINCREMENT,
    viewer_id int not null,
    person_displayed_id int not null,
    FOREIGN KEY (viewer_id) REFERENCES person(person_id),
    FOREIGN KEY (person_displayed_id) REFERENCES person(person_id),
    UNIQUE (viewer_id, person_displayed_id)
);

create table contact (
    contact_id INTEGER PRIMARY KEY,
    person_id INTEGER,
    type TEXT CHECK (type IN ('phone', 'email', 'social')) NOT NULL,
    value VARCHAR(100),
    FOREIGN KEY (person_id) REFERENCES person(person_id)
);
```

## Questions and Results

### Q: Which users matched using this dating app?

**SQL Query**:

```sql
SELECT p1.firstname
AS person1_firstname, p1.lastname
AS person1_lastname, p2.firstname
AS person2_firstname, p2.lastname
AS person2_lastname, m.matched_on
FROM match m
JOIN person p1
ON m.person_id_1 = p1.person_id
JOIN person p2
ON m.person_id_2 = p2.person_id;
```

**Raw Response**:

```json
[{\"person1_firstname\":\"Alice\",\"person1_lastname\":\"Smith\",\"person2_firstname\":\"Bob\",\"person2_lastname\":\"Johnson\",\"matched_on\":\"2025-05-10 19:47:35\"},{\"person1_firstname\":\"Charlie\",\"person1_lastname\":\"Brown\",\"person2_firstname\":\"Diana\",\"person2_lastname\":\"Miller\",\"matched_on\":\"2025-05-10 19:47:35\"}]
```

**Friendly Summary**:
Of course! Here you go: On May 10th, 2025, Alice Smith matched with Bob Johnson, and Charlie Brown matched with Diana Miller.

### Q: Which users are in similar locations?

**SQL Query**:

```sql
SELECT p1.person_id
AS person1_id, p2.person_id
AS person2_id
FROM location l1
JOIN location l2
ON l1.address_id = l2.address_id
AND l1.person_id < l2.person_id
JOIN person p1
ON l1.person_id = p1.person_id
JOIN person p2
ON l2.person_id = p2.person_id;
```

**Raw Response**:

```json
[]
```

**Friendly Summary**:
It seems that no users are currently in similar locations. Let me know if there's anything else I can help you with!

### Q: Do any of the users have multiple matches?

**SQL Query**:

```sql
SELECT person_id_1
FROM match
GROUP BY person_id_1
HAVING COUNT(*) > 1;
```

**Raw Response**:

```json
[]
```

**Friendly Summary**:
Sure! It seems that none of the users have multiple matches based on the query. Is there anything else you'd like to know?

### Q: What are the different locations where the users live?

**SQL Query**:

```sql
SELECT DISTINCT a.city, a.state
FROM location l
JOIN address a
ON l.address_id = a.address_id;
```

**Raw Response**:

```json
[{\"city\":\"Springfield\",\"state\":\"IL\"},{\"city\":\"Chicago\",\"state\":\"IL\"}]
```

**Friendly Summary**:
Sure! It looks like the users live in Springfield and Chicago, both of which are in Illinois.

### Q: How many people are using the dating app?

**SQL Query**:

```sql
SELECT COUNT(*) FROM person;
```

**Raw Response**:

```json
[{ "COUNT(*)": 4 }]
```

**Friendly Summary**:
Certainly! It looks like there are currently 4 people using the dating app.

### Q: Who has a contact method of email?

**SQL Query**:

```sql
ite
SELECT person.firstname, person.lastname, contact.value
FROM person
JOIN contact ON person.person_id = contact.person_id
WHERE contact.type = 'email';
```

**Raw Response**:

```json
[
  { "firstname": "Alice", "lastname": "Smith" },
  { "firstname": "Bob", "lastname": "Johnson" }
]
```

**Error**:
SQLITE_ERROR: near \"ite\": syntax error

### Q: Who is the most attractive person on this dating app?

**SQL Query**:

```sql
SELECT person.firstname, person.lastname, COUNT(match.match_id) AS match_count
FROM person
JOIN match ON person.person_id = match.person_id_1
OR person.person_id = match.person_id_2
GROUP BY person.person_id
ORDER BY match_count DESC
LIMIT 1;
```

**Raw Response**:

```json
[{\"firstname\":\"Diana\",\"lastname\":\"Miller\",\"match_count\":1}]
```

**Friendly Summary**:
Certainly! Based on the data, it looks like the most attractive person on the dating app is Diana Miller.

### Q: What should a user do to get more matches?

**SQL Query**:

```sql
SELECT interest.name, COUNT(match.match_id) as match_count
FROM interest
JOIN person_interest ON interest.interest_id = person_interest.interest_id
JOIN match ON (match.person_id_1 = person_interest.person_id
OR match.person_id_2 = person_interest.person_id)
GROUP BY interest.interest_id
ORDER BY match_count DESC;
```

**Raw Response**:

```json
[{\"name\":\"Hiking\",\"match_count\":3},{\"name\":\"Dogs\",\"match_count\":1},{\"name\":\"Yoga\",\"match_count\":1},{\"name\":\"Music\",\"match_count\":1},{\"name\":\"Cooking\",\"match_count\":1}]
```

**Friendly Summary**:
To increase your matches, consider highlighting your interest in hiking, as it’s the most popular among others. You could also showcase your love for dogs, yoga, music, or cooking, as these interests resonate well with others too. Connecting over shared hobbies is a great way to boost your chances of making meaningful connections!
