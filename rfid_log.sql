ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'dontwastetime';

create database csdl_iot;
use csdl_iot;

create table Systemlog
(
	Id INT AUTO_INCREMENT PRIMARY KEY,
    CardID VARCHAR(255) NOT NULL ,
    ThoiGianQuetThe DATETIME NOT NULL,
    ThaoTac varchar(255) NOT NULL CHECK (ThaoTac IN ('Check-in', 'Check-out')),
    FOREIGN KEY (CardID) REFERENCES Quanlithe(CardID)
);

create table Quanlithe
(
	CardID varchar(255) NOT NULL primary key,
    BienSoXe varchar(255),
    ChuXe varchar(255)
);

select * from Systemlog;
select * from Quanlithe;

drop table Quanlithe; 
drop table Systemlog;

insert into Quanlithe values("17921521375","50N199999","Nguyen Van A");
insert into Quanlithe values("213413173", "49E122222", "Nguyen Van B");

INSERT INTO Systemlog (CardID, ThoiGianQuetThe, ThaoTac)
VALUES ('17921521375', NOW(), 'Check-in');

delete from Systemlog where CardID = "17921521375";
delete from Systemlog where CardID = "213413173";