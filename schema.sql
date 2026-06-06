create type approval_status as enum ('pending', 'approved', 'rejected');
create type level_type as enum ('series', 'parallel_any', 'parallel_all');
create type user_role as enum ('admin', 'approvalCreator', 'editRoles', 'removeUser', 'addUser');

create table workspaces (
    id serial primary key,
    name varchar(100) not null
);

create table users (
    id serial primary key,
    email varchar(255) unique not null,
    first_name varchar(100) not null,
    last_name varchar(100) not null
);

create table approval_rounds (
    id serial primary key,
    user_id int references users(id),
    workspace_id int references workspaces(id),
    title varchar(255) not null,
    subject varchar(255),
    body text,
    status approval_status default 'pending',
    created_at timestamp default current_timestamp
);

create table level_data (
    id serial primary key,
    appr_id int references approval_rounds(id),
    level int not null,
    type level_type not null,
    status approval_status default 'pending'
);

create table node_data (
    id serial primary key,
    level_data_id int references level_data(id),
    user_id int references users(id),
    status approval_status default 'pending'
);

create table roles (
    user_id int references users(id),
    workspace_id int references workspaces(id),
    role user_role not null,
    primary key (user_id, workspace_id, role)
);

create table comments (
    id serial primary key,
    user_id int references users(id),
    appr_id int references approval_rounds(id),
    comment text not null,
    created_at timestamp default current_timestamp
);

create table files (
    id serial primary key,
    appr_id int references approval_rounds(id),
    file_url varchar(500) not null,
    original_name varchar(255) not null
);

create table pending_approvals (
    id serial primary key,
    appr_id int references approval_rounds(id),
    user_id int references users(id),
    arrived_at timestamp default current_timestamp
);