export function readJsonFile(filename) {
    return fetch(filename)
        .then(function(response){ return response.json(); })
        .then(function(data) {
            return data;
        });
}