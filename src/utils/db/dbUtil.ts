import mongoose from "mongoose";
import crypto from "crypto";

export const transformIdSchemaOptions: mongoose.ToObjectOptions = {
    virtuals: true,
    versionKey: false,
    transform: function (doc: any, ret: any) { delete ret._id; ret.id = doc._id; }
}

export function transformIds(data: any[]) {
    data.map(i=>transformId(i));
    return data;
}

export function transformId(data: any) {
    if (!data) return data;
    data.id = data._id;
    delete data._id;
    return data;
}

export function generateRandomId() {
    return crypto.randomInt(281474976710655);;
}