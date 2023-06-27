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

const previousId = new Map<string, number>();

export function generateRandomId(unique: string) {
    let id;
    if (previousId.get(unique) || 0 >= Date.now()) id = (previousId.get(unique) || 0) + 1;
    else id = Date.now();

    previousId.set(unique, id);
    return id;
}