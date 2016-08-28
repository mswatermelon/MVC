var Router = {
    handle: function(route) {
        let routeName = route + "Route";

        // Скрыть фильрацию фото
        let forSort = document.getElementById("forSort");
        if (routeName == "photoRoute") {
            forSort.style.display = "block";
        }
        else forSort.style.display = "none";

        Controller[routeName]();
    }
};

