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
        return this.callApi('groups.get', {v: '5.53', extended: 1});
    },
    getPhoto: function() {
        let that = this,
            photoItems,
            albums;

        return this.callApi('photos.getAll', {v: '5.53', extended: 1, count:200})
            .then(function(photos) {
                let albums = [];
                photoItems = photos;
                for (let photo of photoItems.items) {
                    photo.comments = [];
                    albums.push(photo.album_id);
                }
                return that.callApi('photos.getAllComments', {
                    v: '5.53',
                    extended: 1,
                    count: 100
                }).then(function(comments){
                    let users = [];

                    for(let comment of comments.items){
                        users.push(comment.from_id);
                    }
                    console.log('Users', users);

                    return that.callApi('users.get', {
                        v: '5.53',
                        user_ids: JSON.stringify(users).replace('[','').replace(']',''),
                        fields: 'photo_50'
                    }).then(function (users) {
                        console.log(users);

                        return that.callApi('photos.getAlbums', {
                            v: '5.53',
                            album_ids: JSON.stringify(albums).replace('[','').replace(']','')
                        }).then(function (albums) {
                            console.log(albums);
                            for (let album of albums.items) {
                                album.photos = [];
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
                                    if (photo.album_id == album.id) {
                                        album.photos.push(photo);
                                    }
                                }
                            }
                            return photoItems;
                        });

                    });
                });
            });
    }
};
