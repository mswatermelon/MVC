var Model = {
    login: function(appId, perms) {
        return new Promise(function(resolve, reject) {
            VK.init({
                apiId: appId
            });

            VK.Auth.login(function(response) {
                if (response.session) {
                    resolve(response);
                } else {
                    reject(new Error('Не удалось авторизоваться'));
                }
            }, perms);
        });
    },
    callApi: function(method, params) {
        return new Promise(function(resolve, reject) {
            VK.api(method, params, function(response) {
                if (response.error) {
                    reject(new Error(response.error.error_msg));
                } else {
                    resolve(response.response);
                }
            });
        });
    },
    getUser: function() {
        return this.callApi('users.get', {});
    },
    getMusic: function() {
        return this.callApi('audio.get', {});
    },
    getFriends: function() {
        return this.callApi('friends.get', {fields: 'photo_100'});
    },
    getNews: function() {
        return this.callApi('newsfeed.get', {filters: 'post', count: 20});
    },
    getGroups: function() {
        // Запросить все группы пользователя
        return this.callApi('groups.get', {v: '5.53', extended: 1});
    },
    getPhotos: function() {
        // Запросить все фото пользователя
        return this.callApi('photos.getAll', {v: '5.53', extended: 1, count:200});
    },
    getAlbums: function(albums) {
        // Запросить все альбомы фотографий пользователя
        return this.callApi('photos.getAlbums', {
            v: '5.53',
            album_ids: JSON.stringify(albums).replace('[','').replace(']','')
        });
    },
    getComments: function() {
        // Запросить все комментарии к фотографиям пользователя
        return this.callApi('photos.getAllComments', {
            v: '5.53',
            extended: 1,
            count: 100
        });
    },
    getUsers: function (users) {
        // Запросить информацию о нескольких пользователях
        return this.callApi('users.get', {
            v: '5.53',
            user_ids: JSON.stringify(users).replace('[','').replace(']',''),
            fields: 'photo_50'
        });
    },
    getPhoto: function() {
        // Запросить фото пользователя, распределенные по альбомам
        let that = this;

        return this.getPhotos()
            // Когда получаем фото
            .then(function(photoItems) {
                let albums = [];

                // Подготавливаем массивы для комментариев в фото,
                // для фото в альбомах
                for (let photo of photoItems.items) {
                    photo.comments = [];
                    albums.push(photo.album_id);
                }

                // Когда получаем комментарии
                return that.getComments()
                    .then(function(comments){
                    let users = [];

                    // Заполняем массив с пользователями
                    for(let comment of comments.items){
                        users.push(comment.from_id);
                    }

                    // Отправляем список пользователей и получаем информацию
                    return that.getUsers(users)
                        .then(function (users) {

                        return that.getAlbums(albums)
                            // Когда получаем список альбомов собираем данные вместе
                            .then(function (albums) {
                            // К комментарию добавляем данные о пользователе
                            // К фото добавляем комментарий
                            for (let photo of photoItems.items) {
                                for (let comment of comments.items) {
                                    for (let user of users) {
                                        if (user.id == comment.from_id) {
                                            comment.first_name = user.first_name;
                                            comment.last_name = user.last_name;
                                            comment.photo_50 = user.photo_50;
                                        }
                                    }

                                    if (comment.pid == photo.id) {
                                        photo.comments.push(comment);
                                    }
                                }
                            }
                            //Добавляем фото в альбом
                            for (let album of albums.items) {
                                album.photos = [];

                                for (let photo of photoItems.items) {
                                    if (photo.album_id == album.id) {
                                        album.photos.push(photo);
                                    }
                                }
                            }

                            // Возвращаем собранные данные
                            return albums;
                        });

                    });
                });
            });
    },
    updatePhoto: function(params){
        // Обновить фото в соответствии с выбранной сортировкой
        let that = this;

        this.getPhoto().then(function(albums) {
            // Сортиовку проводить в зависимости от типа данных
            switch (params[0]){
                case "date":
                    albums = that.sortByDates(albums, params[1]);
                    break;
                case "comments":
                    albums = that.sortByComments(albums, params[1]);
                    break;
                case "reposts":
                    albums = that.sortByReposts(albums, params[1]);
                    break;
                case "likes":
                    albums = that.sortByLikes(albums, params[1]);
                    break;
            }

            return Controller.updateRoute(albums);
        });
    },
    sortByDates: function (albums, order) {
        for(let album of albums.items){
            // Сортировка по дате
            album.photos = album.photos.sort(function (a, b) {
                if (order == "desc") {
                    // Минус, так как применяю helper c обратным следованием
                    return -(new Date(a.date).getTime() - new Date(b.date).getTime());
                }
                else {
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                }
            })
        }
        return albums;
    },
    sortByComments: function (albums, order) {
        for(let album of albums.items){
            // Сортировка по количеству комментариев
            album.photos = album.photos.sort(function (a, b) {
                if (order == "desc") {
                    // Минус, так как применяю helper c обратным следованием
                    return -(a.comments.length - b.comments.length);
                }
                else {
                    return a.comments.length - b.comments.length;
                }
            })
        }
        return albums;
    },
    sortByReposts: function (albums, order) {
        for(let album of albums.items){
            // Сортировка по количеству репостов
            album.photos = album.photos.sort(function (a, b) {
                if (order == "desc") {
                    // Минус, так как применяю helper c обратным следованием
                    return -(a.reposts.count - b.reposts.count);
                }
                else {
                    return a.reposts.count - b.reposts.count;
                }
            })
        }
        return albums;
    },
    sortByLikes: function (albums, order) {
        for(let album of albums.items){
            // Сортировка по количеству лайков
            album.photos = album.photos.sort(function (a, b) {
                if (order == "desc") {
                    // Минус, так как применяю helper c обратным следованием
                    return -(a.likes.count - b.likes.count);
                }
                else {
                    return a.likes.count - b.likes.count;
                }
            })
        }
        return albums;
    }
};
