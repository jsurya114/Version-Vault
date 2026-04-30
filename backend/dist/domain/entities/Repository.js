"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = void 0;
class Repository {
    id;
    name;
    description;
    visibility;
    ownerId;
    ownerUsername;
    defaultBranch;
    stars;
    forks;
    size;
    isDeleted;
    createdAt;
    updatedAt;
    constructor(props) {
        this.id = props.id;
        this.name = props.name;
        this.description = props.description;
        this.visibility = props.visibility;
        this.ownerId = props.ownerId;
        this.ownerUsername = props.ownerUsername;
        this.defaultBranch = props.defaultBranch ?? 'main';
        this.stars = props.stars ?? 0;
        this.forks = props.forks ?? 0;
        this.size = props.size ?? 0;
        this.isDeleted = props.isDeleted ?? false;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
}
exports.Repository = Repository;
