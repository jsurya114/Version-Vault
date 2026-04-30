"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    id;
    userId;
    username;
    email;
    password;
    avatar;
    bio;
    role;
    isVerified;
    isBlocked;
    provider;
    subscriptionPlan;
    followersCount;
    followingCount;
    createdAt;
    updatedAt;
    constructor(props) {
        this.id = props.id;
        this.userId = props.userId;
        this.username = props.username;
        this.email = props.email;
        this.password = props.password;
        this.avatar = props.avatar;
        this.bio = props.bio;
        this.role = props.role;
        this.isVerified = props.isVerified;
        this.isBlocked = props.isBlocked;
        this.provider = props.provider;
        this.subscriptionPlan = props.subscriptionPlan;
        this.followersCount = props.followersCount;
        this.followingCount = props.followingCount;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
}
exports.User = User;
