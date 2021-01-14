DROP SCHEMA IF EXISTS `habitizer` ;
CREATE SCHEMA IF NOT EXISTS `habitizer` DEFAULT CHARACTER SET utf8 ;
USE `habitizer` ;

DROP TABLE IF EXISTS `habitizer`.`users`;

CREATE TABLE IF NOT EXISTS `habitizer`.`users` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(64) NOT NULL,
  `password` VARCHAR(64) NOT NULL,
  `first_name` VARCHAR(64) NOT NULL,
  `last_name` VARCHAR(64) NOT NULL,
  `email_address` VARCHAR(64) NOT NULL,
  `is_google` TINYINT DEFAULT 0,
  `calendar_id` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (user_id)
  );
  
select * from users;
  
insert into users (username, password, first_name, last_name, email_address, is_google, calendar_id) 
values (?, sha1(?), ?, ?, ?, ?, false, null);

select count(*) as count from users where username = ?;
select * from users where username = ? && password = sha1(?);


DROP TABLE IF EXISTS `habitizer`.`habits`;

CREATE TABLE IF NOT EXISTS `habitizer`.`habits` (
`habit_id` INT NOT NULL AUTO_INCREMENT,
`username` VARCHAR(255) NOT NULL,
`habit_title` VARCHAR(255) NOT NULL,
`parameter` VARCHAR(255) NOT NULL,
`unit` VARCHAR(255) NOT NULL,
`start_date` VARCHAR(255),
`end_date` VARCHAR(255),
`calendar_id` VARCHAR(255),
PRIMARY KEY (habit_id)
);

select * from habits;

select * from habits where username = ?;

insert into habits (username, habit_title, parameter, unit, start_date, end_date, calendar_id) values (?, ?, ?, ?, ?, ?, ?);

select count(*) as count from habits where username = ? && habit_title = ?;

select habit_id, habit_title, parameter, unit, start_date from habits where habit_id = ?;

DROP TABLE IF EXISTS `habitizer`.`records`;

CREATE TABLE IF NOT EXISTS `habitizer`.`records` (
`id` INT NOT NULL AUTO_INCREMENT,
`habit_id` INT NOT NULL,
`username` VARCHAR(255) NOT NULL,
`ObjectId` VARCHAR(255) NOT NULL,
PRIMARY KEY (id)
);

select * from records;

insert into records (habit_id, username, ObjectId) values (?, ?, ?);
