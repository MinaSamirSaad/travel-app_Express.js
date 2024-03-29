const UserModel = require('../Models/user.model');
const {resData} = require('../helperFunctions');
class UserController {
    static register = async (req, res) => {
        try {
            const user = await new UserModel({ ...req.body, isAdmin: false });
            await user.save();
            const token = await user.generateToken();
            await user.populate("myTrips");
            await user.populate("myFavorites");
            const data = {
                user,
                token,
                bookedTrips: user.myTrips,
                FavoriteTrips: user.myFavorites
            }
            resData(res, 200, true, data, "success adding");
        }
        catch (e) {
            resData(res, 500, false, {}, e.message);
        }
    }

    static userData = async (req, res) => {
        try {
            await req.user.populate("myTrips");
            await req.user.populate("myFavorites");
            const data = {
                user: req.user,
                bookedTrips: req.user.myTrips,
                FavoriteTrips: req.user.myFavorites
            }
            resData(res, 200, true, data, "success get data");
        }
        catch (e) {
            resData(res, 500, false, {}, e.message);
        }
    }
    static addFavoriteTrips = async (req, res) => {
        try {
            const favoriteTrips = req.body;
            const user = req.user;
            user.favorites = favoriteTrips;
            await user.save();
            resData(res, 200, true, user, "success add to favorite");
        }
        catch (e) {
            resData(res, 500, false, {}, e.message);
        }
    }

    static logInUser = async (req, res) => {
        try {
            const user = await UserModel.loginMe(req.body.email, req.body.password);
            const token = await user.generateToken();
            await user.populate("myTrips");
            await user.populate("myFavorites");
            const data = {
                user,
                token,
                bookedTrips: user.myTrips,
                FavoriteTrips: user.myFavorites
            }
            resData(res, 200, true, data, "success login");
        }
        catch (e) {
            resData(res, 500, false, {}, e.message);
        }
    }
    static logInGoogle = async (req, res) => {
        try {
            let user = await UserModel.findOne({ email: req.body.email })
            if (!user) {
                user = new UserModel({
                    userName: req.body.name,
                    email: req.body.email,
                    googleId: req.body.googleId,
                    image: req.body.image

                })
                await user.save()
            }
            const token = await user.generateToken();
            await user.populate("myTrips");
            await user.populate("myFavorites");
            const data = {
                user,
                token,
                bookedTrips: user.myTrips,
                FavoriteTrips: user.myFavorites
            }
            resData(res, 200, true, data, "success login");
        }
        catch (err) {
            resData(res, 500, false, err.message, "Failed to login")
        }
    }
    static logOutUser = async (req, res) => {
        try {
            req.user.tokens = req.user.tokens.filter((tok) => tok.token != req.token);
            await req.user.save();
            resData(res, 200, true, req.user, "success logout");

        }
        catch (e) {
            resData(res, 500, false, {}, e.message);
        }
    }

    static editUser = async (req, res) => {
        try {
            for (let key in req.body) {
                if (key != "isAdmin") {
                    req.user[key] = req.body[key]
                }
            }
            await req.user.save();
            resData(res, 200, true, req.user, "success update");
        }
        catch (e) {
            resData(res, 500, false, {}, e.message);
        }
    }
}

module.exports = UserController;