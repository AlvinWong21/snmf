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
  `gender` VARCHAR(64) NOT NULL,
  PRIMARY KEY (user_id)
  );
  
select * from users;
  
insert into users (username, password, first_name, last_name, email_address, gender) 
values ('vin', sha1('vin'), 'Alvin', 'Wong', 'vinvin@gmail.com', 'male');

select count(*) as count from users where username = 'vid';
select username from users where username = 'vin' && password = sha1('vin');


DROP TABLE IF EXISTS `habitizer`.`habits`;

CREATE TABLE IF NOT EXISTS `habitizer`.`habits` (
`habit_id` INT NOT NULL AUTO_INCREMENT,
`habit_title` VARCHAR(255) NOT NULL,
`parameter` VARCHAR(255) NOT NULL,
`unit` VARCHAR(255) NOT NULL,
`start_date` DATE NOT NULL,
`end_date` DATE,
`frequency` VARCHAR(255),
PRIMARY KEY (habit_id)
);

select * from habits;

insert into habits (habit_title, parameter, unit, start_date, end_date, frequency) values (?, ?, ?, ?, ?, ?);

select count(*) as count from habits where habit_title = "drink water";

select habit_id, habit_title, parameter, unit, start_date from habits where habit_id = "1";

