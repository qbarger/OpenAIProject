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