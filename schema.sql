create type approval_status as enum ('pending', 'approved', 'rejected');
create type level_type as enum ('series', 'parallel_any', 'parallel_all');
create type user_role as enum ('admin', 'approvalCreator', 'editRoles', 'removeUser', 'addUser', 'member');

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
    user_id int references users(id) on delete cascade,
    workspace_id int references workspaces(id) on delete cascade,
    title varchar(255) not null,
    subject varchar(255),
    body text,
    status approval_status default 'pending',
    created_at timestamp default current_timestamp
);  

create table level_data (
    id serial primary key,
    appr_id int references approval_rounds(id) on delete cascade,
    level int not null,
    type level_type not null,
    status approval_status default 'pending'
);

create table node_data (
    id serial primary key,
    level_data_id int references level_data(id) on delete cascade,
    node_order int not null,
    user_id int references users(id) on delete cascade,
    status approval_status default 'pending'
);

create table roles (
    user_id int references users(id) on delete cascade,
    workspace_id int references workspaces(id) on delete cascade,
    role_name user_role not null,
    primary key (user_id, workspace_id, role_name)
);

create table comments (
    id serial primary key,
    user_id int references users(id) on delete cascade,
    appr_id int references approval_rounds(id) on delete cascade,
    comment text not null,
    created_at timestamp default current_timestamp
);

create table files (
    id serial primary key,
    appr_id int references approval_rounds(id) on delete cascade,
    file_url varchar(500) not null,
    original_name varchar(255) not null
);

create table pending_approvals (
    id serial primary key,
    appr_id int references approval_rounds(id) on delete cascade,
    node_id int references node_data(id) on delete cascade,
    user_id int references users(id) on delete cascade,
    arrived_at timestamp default current_timestamp
);

create index idx_users_email on users(email);

-- think about index on node_data(user_id)