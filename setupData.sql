INSERT INTO person (person_id, firstname, lastname, birthdate, gender, bio) VALUES
(1, 'Alice', 'Smith', '1990-06-15', 'f', 'Loves hiking and dogs.'),
(2, 'Bob', 'Johnson', '1988-11-02', 'm', 'Tech nerd and foodie.'),
(3, 'Charlie', 'Brown', '1992-03-25', 'm', 'Music enthusiast.'),
(4, 'Diana', 'Miller', '1995-09-10', 'f', 'Yoga and nature lover.');

INSERT INTO address (address_id, street, city, state, zip_code, latitude, longitude) VALUES
(1, '123 Maple St', 'Springfield', 'IL', '62704', 39.7817, -89.6501),
(2, '456 Oak Ave', 'Springfield', 'IL', '62704', 39.7800, -89.6510),
(3, '789 Pine Rd', 'Chicago', 'IL', '60614', 41.9227, -87.6533),
(4, '101 Elm Dr', 'Chicago', 'IL', '60614', 41.9230, -87.6540);

INSERT INTO location (person_id, address_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4);

INSERT INTO interest (interest_id, name) VALUES
(1, 'Hiking'),
(2, 'Cooking'),
(3, 'Music'),
(4, 'Yoga'),
(5, 'Dogs');

INSERT INTO person_interest (person_id, interest_id) VALUES
(1, 1), -- Alice: Hiking
(1, 5), -- Alice: Dogs
(2, 2), -- Bob: Cooking
(2, 1), -- Bob: Hiking
(3, 3), -- Charlie: Music
(4, 1), -- Diana: Hiking
(4, 4); -- Diana: Yoga

INSERT INTO match (match_id, person_id_1, person_id_2) VALUES
(1, 1, 2),
(2, 3, 4);

INSERT INTO feed (feed_id, viewer_id, person_displayed_id) VALUES
(1, 1, 2),
(2, 1, 3),
(3, 2, 1),
(4, 2, 4),
(5, 3, 1);

INSERT INTO contact (contact_id, person_id, type, value) VALUES
(1, 1, 'email', 'alice@example.com'),
(2, 1, 'phone', '555-1234'),
(3, 2, 'email', 'bob@example.com'),
(4, 3, 'social', '@charlieb'),
(5, 4, 'phone', '555-9876');
