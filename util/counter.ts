import db from './db';

/**
 * initialize internal tallies to the database
 */
export const init = () => {
    initBumpCounter();
    initDumpCounter();
}

const initBumpCounter = async () => {
    return await db.createBumpCounter();
}

export const increaseTotalBumpCount = async () => {
    return await db.increaseBumpCounter();
}

const initDumpCounter = async () => {
    return await db.createDumpCounter();
}

export const increaseTotalDumpCount = async () => {
    return await db.increaseDumpCounter();
}