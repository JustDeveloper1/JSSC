function compress() {
    const input = prompt();
    if (!input || input.length < 1) {
        alert('No input provided.');
        return
    }
    const compressed = JSSC.compress(input);
    alert(`Saved ${(input.length - compressed.length) * 16 / 8} bytes.\nOutput string:\n\n${compressed}`);
}
function decompress() {
    const input = prompt();
    if (!input || input.length < 1) {
        alert('No input provided.');
        return
    }
    const decompressed = JSSC.decompress(input);
    alert(`Decompressed:\n\n${decompressed}`);
}
