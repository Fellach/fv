create table client (
    id integer not null auto_increment,
    short_name VARCHAR (2dz55) not null,
    long_name VARCHAR (2dz55) not null,
    address VARCHAR (64) not null,
    city VARCHAR (64) not null,
    zip VARCHAR(6) not null,
    country VARCHAR (64) DEFAULT 'Polska',
    nip VARCHAR (10) not null,
    regon VARCHAR (10) not null,
    email VARCHAR (32) null,
    phone VARCHAR (16) null,
    thumbnail VARCHAR (512) null,
    updated_at date,
    created_at timestamp,

    PRIMARY KEY (id)
)engine=innodb; 


create table document(
    id integer not null auto_increment,
    serial_number integer not null,
    serial_number_suffix VARCHAR(32) null,
    client_id integer not null,
    vat decimal(9, 2) not null,
    netto decimal(9, 2) not null,
    brutto decimal(9, 2) not null,
    sell_date date not null,
    print_date date not null,
    payment VARCHAR(32) not null,
    payment_offset tinyint not null,
    in_word VARCHAR (255) null,
    updated_at date,
    created_at timestamp not null,
	PRIMARY KEY (id),
    CONSTRAINT fk_client
    	FOREIGN KEY (client_id)
    	REFERENCES client (id)
    )engine=innoDB;


create table item(
    id integer not null auto_increment,
    title VARCHAR (255) not null,
    document_id integer not null,
    price decimal(9, 2) not null,
    vat tinyint not null,
    pieces integer not null,
    vat_value decimal(9, 2) not null,
    netto decimal(9, 2) not null,
    brutto decimal(9, 2) not null,
    updated_at date,
    created_at timestamp not null,
    PRIMARY KEY (id),
    CONSTRAINT fk_document
        FOREIGN KEY (document_id)
        REFERENCES document (id)
        ON DELETE CASCADE ON UPDATE CASCADE
    )engine=innoDB;


create table user(
    id integer not null auto_increment,
    name VARCHAR (64) not null,
    password VARCHAR (64) not null,
    created_at timestamp not null,
	PRIMARY KEY (id)
    )engine=innoDB;



#--never change the values
create table `options`(
    `id` integer not null auto_increment,
    `key` VARCHAR (32) not null,
    `value` VARCHAR (192) not null,    
    PRIMARY KEY (id),
    UNIQUE KEY `key_value_idx` (`key`(3),`value`(3))
    )engine=innoDB;