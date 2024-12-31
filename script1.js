//Hoàng Đức Khải - 20225341 - Project I
//Lấy tham chiếu tới các phần tử trong giao diện
const inputTextarea = document.querySelector('.inputdata');             //Tham chiếu đến ô nhập dữ liệu
const outputTextarea = document.querySelector('.outputdata');           //Tham chiếu đến ô kết quả
outputTextarea.readOnly = true;                                         //Thiết lập ô kết quả ở dạng "Chỉ đọc"

const hamiltonButton = document.querySelector('.feature1');             //Tham chiếu đến chức năng chu trình Hamilton
const connectedComponentsButton = document.querySelector('.feature2');  //Tham chiếu đến chức năng Thành phần liên thông
const shortestPathButton = document.querySelector('.feature3');         //Tham chiếu tới chức năng tìm đường đi ngắn nhất

//Hàm đọc dữ liệu từ textarea
function parseGraphInput(input){
    const lines = input
        .trim()
        .split('\n')                  //Tách dữ liệu thành các dòng
        .map(line => line.trim())     //Xóa khoảng trắng thừa ở đầu/cuối dòng
        .filter(line => line !== ''); //Loại bỏ các dòng trống
    if(lines.length < 2){
        throw new Error('Dữ liệu đầu vào không hợp lệ!');
    }
    const [firstLine, ...restLines] = lines;
    const [nVertices, nEdges] = firstLine.split(/\s+/).map(Number); //Dòng đầu tiên chứa các giá trị về số lượng đỉnh, số lượng cạnh
    if(isNaN(nVertices) || isNaN(nEdges) || nVertices <= 0 || nEdges < 0){
        throw new Error('Dữ liệu đầu vào không hợp lệ!');   //kiểm tra điều kiện nhập dữ liệu về số cạnh, số đỉnh
    }
    if(restLines.length !== nEdges){    //Đảm bảo số lượng thông tin cạnh nhập vào = đúng số lượng cạnh đã khai báo
        throw new Error('Dữ liệu đầu vào không hợp lệ!');
    }
    //Tạo danh sách đỉnh từ các cặp cạnh (Set để tránh trùng lặp)
    const vertices = new Set();       
    //Khởi tạo danh sách các cạnh của đồ thị
    const edges = restLines.map(line => {
        //Loại bỏ khoảng trắng thừa giữa các giá trị
        const parts = line.split(/\s+/); //Tách bằng bất kỳ khoảng trắng nào (bao gồm nhiều khoảng trắng)
        if(parts.length < 2){         //Báo lỗi nếu không đủ thông tin
            throw new Error('Dữ liệu cạnh không hợp lệ!');
        }
        const [u, v, w] = parts;        //Lấy đỉnh 1, đỉnh 2, và trọng số
        vertices.add(u);
        vertices.add(v);
        return { u, v, w: w !== undefined ? Number(w) : 1 }; //Mặc định trọng số là 1 nếu không có
    });
    if(vertices.size > nVertices){      //Đảm bảo số lượng đỉnh đúng với đã khai báo
        throw new Error('Dữ liệu đầu vào không hợp lệ!');
    }
    return { verticesCount: nVertices, edges, vertices: Array.from(vertices) };
}

//Tạo danh sách kề
function buildAdjacencyList(edges){
    const graph = {};   //Khởi tạo danh sách kề
    edges.forEach(({ u, v, w }) => {    //Tạo danh sách kề từ danh sách cạnh
        if(!graph[u]) graph[u] = [];
        if(!graph[v]) graph[v] = [];
        graph[u].push({ node: v, weight: w });
        graph[v].push({ node: u, weight: w });
    });
    return graph;
}

//Hàm backtracking chung
function hamiltonianBacktrack(graph, verticesCount, current, visited, path, findCycle){
    if(path.length === verticesCount){
        //Kiểm tra nếu như đỉnh đang xét(current) có kề với đỉnh đầu tiên hay không
        if(graph[current].some(neighbor => neighbor.node === path[0])){
            if (findCycle) path.push(path[0]);
            return true;
        }
        return false;
    }

    for(const { node: neighbor } of graph[current] || []){
        if(!visited.has(neighbor)){   //Nếu như đỉnh kề (neighbor) của đỉnh đang xét (current) chưa được thăm
            visited.add(neighbor);
            path.push(neighbor);        //Thêm neighbor vào hành trình
            //Kiểm tra đỉnh tiếp theo
            if(hamiltonianBacktrack(graph, verticesCount, neighbor, visited, path, findCycle)){
                return true;            //Trả về true nếu tìm được chu trình Hamilton
            }
            visited.delete(neighbor);   //Reset lại trạng thái của neighbor, quay lui
            path.pop();                 //Xóa neighbor khỏi hành trình
        }
    }
    return false;
}

//Hàm kiểm tra chu trình Hamilton
function hasHamiltonianCycle(verticesCount, edges){
    const graph = buildAdjacencyList(edges);
    const visited = new Set();
    const path = [];
    //Xét đỉnh đầu tiên trong danh sách đỉnh của đồ thị
    for(const start of Object.keys(graph)){
        visited.clear();    //Reset tất cả trạng thái của các đỉnh
        path.length = 0;    
        visited.add(start); //Tiến hành xét đỉnh bắt đầu và thêm vào chu trình
        path.push(start);
        //Kiểm tra đồ thị có chu trình Hamilton hay không
        if(hamiltonianBacktrack(graph, verticesCount, start, visited, path, false)){
            return true;
        }
    }
    return false;
}

//Hàm tìm chu trình Hamilton
function findHamiltonianCycle(verticesCount, edges) {
    const graph = buildAdjacencyList(edges);
    const visited = new Set();
    const path = [];

    for(const start of Object.keys(graph)){
        visited.clear();
        path.length = 0;
        visited.add(start);
        path.push(start);

        if(hamiltonianBacktrack(graph, verticesCount, start, visited, path, true)){
            return path;
        }
    }
    return null;
}

//Hàm tìm thành phần liên thông
function findConnectedComponents(vertices, edges){
    const graph = buildAdjacencyList(edges);
    const visited = new Set();
    const components = [];      //Khởi tạo danh sách các thành phần liên thông
    //DFS để kiểm tra thành phần liên thông
    function dfs(node, component){
        visited.add(node);
        component.push(node);
        //Nếu gặp đỉnh cô lập, thay thế bằng 1 mảng rỗng để tránh lỗi
        for(const { node: neighbor } of graph[node] || []){
            if(!visited.has(neighbor)){
                dfs(neighbor, component);
            }
        }
    }
    //Duyệt qua tất cả các đỉnh trong đồ thị
    vertices.forEach(vertex => {
        if(!visited.has(vertex)){ //Nếu có 1 đỉnh chưa được thăm
            const component = [];   //Tạo thành phần liên thông mới
            dfs(vertex, component); //Tìm các thành phần liên thông mới
            components.push(component);
        }
    });
    return components;
}

//Hàm tìm đường đi ngắn nhất giữa hai đỉnh (Dijkstra)
function findShortestPath(vertices, edges, start, end) {
    const graph = {};
    vertices.forEach(v => graph[v] = []); //Khởi tạo mảng kề cho từng đỉnh
    edges.forEach(({ u, v, w }) => {
        graph[u].push({ node: v, weight: w });
    });
    const distances = {};
    const prev = {};        //Danh sách đỉnh đã thăm trước đó
    const pq = [];          //Khởi tạo hàng đợi
    vertices.forEach(v => {
        distances[v] = Infinity;    //Đặt khoảng cách là vô cùng
        prev[v] = null;             
    });
    distances[start] = 0;
    pq.push({ node: start, dist: 0 });  //Thêm đỉnh bắt đầu vào hàng đợi
    while(pq.length > 0){
        pq.sort((a, b) => a.dist - b.dist); //Sắp xếp hàng đợi ưu tiên theo thứ tự tăng dần
        const { node: current } = pq.shift(); //Lấy phần tử đầu tiên khỏi hàng đợi
        graph[current].forEach(({ node: neighbor, weight }) => {
            const newDist = distances[current] + weight;
            if(newDist < distances[neighbor]){
                distances[neighbor] = newDist;
                prev[neighbor] = current;
                pq.push({ node: neighbor, dist: newDist }); //Cập nhật neighbor vào hàng đợi
            }
        });
    }
    if(distances[end] === Infinity){
        return null; //Không có đường đi
    }
    const path = [];
    let curr = end;
    while(curr){
        path.unshift(curr); //Thêm đỉnh vào đầu mảng
        curr = prev[curr];  //Lùi về đỉnh trước đó
    }
    return { distance: distances[end], path };
}

//Gắn sự kiện cho các nút
hamiltonButton.addEventListener('click', () => {
    const input = inputTextarea.value;
    if(!input){
        outputTextarea.value = 'Vui lòng nhập dữ liệu đồ thị!';
        return;
    }
    try{
        const { verticesCount, edges } = parseGraphInput(input);
        const hasCycle = hasHamiltonianCycle(verticesCount, edges);
        if(hasCycle){
            const cycle = findHamiltonianCycle(verticesCount, edges);
            outputTextarea.value = `Đồ thị có chứa chu trình Hamilton.\nChu trình: ${cycle.join(' -> ')}`;
        } else{
            outputTextarea.value = 'Đồ thị KHÔNG chứa chu trình Hamilton.';
        }
    } catch(error){
        outputTextarea.value = 'Dữ liệu đầu vào không hợp lệ!';
    }
});

connectedComponentsButton.addEventListener('click', () => {
    const input = inputTextarea.value;
    if(!input){
        outputTextarea.value = 'Vui lòng nhập dữ liệu đồ thị!';
        return;
    }
    try{
        const { vertices, edges } = parseGraphInput(input);
        const components = findConnectedComponents(vertices, edges);
        outputTextarea.value = `Đồ thị có ${components.length} thành phần liên thông.\n` +
            components.map((component, index) => `Thành phần ${index + 1}: ${component.join(', ')}`).join('\n');
    } catch(error){
        outputTextarea.value = 'Dữ liệu đầu vào không hợp lệ!';
    }
});

// Tham chiếu tới các phần tử cần thiết
const startVertexInput = document.querySelector('.dinh_bat_dau'); // Ô nhập đỉnh bắt đầu
const endVertexInput = document.querySelector('.dinh_ket_thuc');  // Ô nhập đỉnh kết thúc

// Hàm vô hiệu hóa nút
function disableShortestPathButton(){
    shortestPathButton.disabled = true;
}

// Hàm kích hoạt lại nút (khi người dùng rời khỏi ô nhập liệu)
function enableShortestPathButton(){
    shortestPathButton.disabled = false; // Kích hoạt lại nút bất kể tình trạng dữ liệu
}

// Gắn sự kiện `focus` và `blur` vào các ô nhập liệu
startVertexInput.addEventListener('focus', disableShortestPathButton);
endVertexInput.addEventListener('focus', disableShortestPathButton);
startVertexInput.addEventListener('blur', enableShortestPathButton);
endVertexInput.addEventListener('blur', enableShortestPathButton);

shortestPathButton.addEventListener('click', () => {
    const input = inputTextarea.value;
    const startVertex = document.querySelector('.dinh_bat_dau').value.trim();
    const endVertex = document.querySelector('.dinh_ket_thuc').value.trim();
    if(!input){
        outputTextarea.value = 'Vui lòng nhập dữ liệu đồ thị!';
        return;
    }
    if(!startVertex || !endVertex){
        outputTextarea.value = 'Vui lòng nhập đầy đủ đỉnh bắt đầu và đỉnh kết thúc!';
        return;
    }
    try{
        const { vertices, edges } = parseGraphInput(input);
        const result = findShortestPath(vertices, edges, startVertex, endVertex);
        if(result){
            outputTextarea.value = `Đường đi ngắn nhất giữa ${startVertex} và ${endVertex} là:\n` +
                `${result.path.join(' -> ')}\nĐộ dài: ${result.distance}`;
        } else{
            outputTextarea.value = `Không tồn tại đường đi giữa ${startVertex} và ${endVertex}.`;
        }
    } catch(error){
        outputTextarea.value = 'Dữ liệu đầu vào không hợp lệ!';
    }
});