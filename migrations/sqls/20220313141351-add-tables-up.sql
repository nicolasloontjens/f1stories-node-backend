/*
db-migrate up --config .\config\database.json
*/
create table user(
  id int primary key auto_increment,
  username nvarchar(200),
  password nvarchar(1000),
  token nvarchar(1000)
);

create table stories(
    storyid int primary key auto_increment,
    title nvarchar(250),
    content nvarchar(5000),
    score int,
    country nvarchar(300),
    date date default (current_date),
    raceid int
);

create table userpoints
(
    userid    int not null,
    userscore int not null,
    foreign key (userid) references user (id)
);

create table userstories(
    userid int,
    storyid int,
    foreign key(userid) references user(id),
    foreign key(storyid) references stories(storyid)
);

create table comments(
    commentid int primary key auto_increment,
    userid int,
    content nvarchar(300),
    foreign key (userid) references user(id)
);

create table storycomments(
    storyid int,
    commentid int,
    foreign key (storyid) references stories(storyid),
    foreign key (commentid) references comments(commentid)
);

create table storyimages(
    storyid int primary key,
    image1 nvarchar(1000),
    image2 nvarchar(1000),
    image3 nvarchar(1000),
    foreign key (storyid) references stories(storyid)
);

create table races(
    raceid int primary key auto_increment,
    title nvarchar(200),
    date date default (current_date)
);
insert into races(title, date)
values('Bahrain GP','2022-03-20'),
    ('Saudi Arabian GP','2022-03-27'),
    ('Australian GP','2022-04-10'),
    ('Italian GP (Imola)','2022-04-24'),
    ('US Miami GP','2022-05-08'),
    ('Spanish GP','2022-05-22'),
    ('Monaco GP','2022-05-29'),
    ('Azerbaijan GP','2022-06-12'),
    ('Canadian GP','2022-06-19'),
    ('British GP','2022-07-03'),
    ('Austrian GP','2022-07-10'),
    ('French GP','2022-07-24'),
    ('Hungarian GP','2022-07-31'),
    ('Belgian GP','2022-08-28'),
    ('Dutch GP','2022-09-04'),
    ('Italian GP','2022-09-11'),
    ('Singapore GP','2022-10-02'),
    ('Japanese GP','2022-10-09'),
    ('United States GP','2022-10-23'),
    ('Mexican GP','2022-10-30'),
    ('Brazilian GP','2022-11-13'),
    ('Abu Dhabi GP','2022-11-20');

create table userraces(
    userid int,
    raceid int,
    foreign key (userid) references user(id),
    foreign key (raceid) references races(raceid)
);

create table userinteracts(
    userid int,
    storyid int,
    interaction int,
    foreign key (userid) references user(id),
    foreign key (storyid) references stories(storyid)
)