export function generateMemoTag(): string {
    const length = 8; // Length of the memo tag
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let memoTag = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        memoTag += characters.charAt(randomIndex);
    }

    return memoTag;
}