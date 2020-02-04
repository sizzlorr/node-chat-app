const users = [];

const addUser = ({ id, userName, room }) => {
    if (!userName || !room) {
        return {
            error: 'User Name and Room are requires'
        }
    }

    userName = userName.trim().toLocaleLowerCase();
    room = room.trim().toLocaleLowerCase();

    const existingUser = users.find((user) => {
        return user.room === room && user.userName === userName
    });

    if (existingUser) {
        return {
            error: 'User Name is already use'
        }
    }

    const user = { id, userName, room };
    users.push(user);

    return { user };
};

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id;
    });
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};

const getUser = (id) => {
    return users.find((user) => {
        return user.id === id;
    })
};

const getUsersInRoom = (room) => {
    return users.filter((user) => {
       return user.room === room.toLowerCase();
    });
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};
