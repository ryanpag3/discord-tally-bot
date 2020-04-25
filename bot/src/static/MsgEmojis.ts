import Commands from './Commands';

const Emojis = {
    [Commands.BUMP]: ':small_red_triangle:',
    [Commands.DUMP]: ':small_red_triangle_down:'
};

export const getEmoji = (command: string) => {
    return Emojis[command] || '';
}
