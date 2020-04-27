import Commands from './Commands';

const Emojis = {
    [Commands.ANNOUNCE_CREATE]: ':trumpet:',
    [Commands.BUMP]: ':small_red_triangle:',
    [Commands.DUMP]: ':small_red_triangle_down:',
    [Commands.TALLY_REACTIONS]: ':flushed:'
};

export const getEmoji = (command: string) => {
    return Emojis[command] || '';
}
