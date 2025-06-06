document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.visualization-container');
    const goalNode = document.querySelector('.goal');
    const questionNodes = document.querySelectorAll('.question');
    const svg = document.querySelector('.lines');
    const numNodes = questionNodes.length;
    const radius = 200; // Increased radius for new container size
    const HOLD_DURATION = 2000; // 2 seconds

    // --- Utility Functions ---

    // Get the center coordinates of a node element
    function getNodeCenter(node) {
        return {
            x: node.offsetLeft + node.offsetWidth / 2,
            y: node.offsetTop + node.offsetHeight / 2
        };
    }
    
    // Create an SVG path with 90-degree turns
    function createRectangularPath(startPoint, endPoint) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        // Path goes horizontally from start, then vertically to end
        const pathData = `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`;
        
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', '#bbb');
        path.setAttribute('stroke-width', 2);
        path.setAttribute('fill', 'none');
        return path;
    }
    
    // A simple promise-based delay
    const delay = ms => new Promise(res => setTimeout(res, ms));

    // --- Main Animation Logic ---

    async function cycleQuestions() {
        // Position question nodes in a circle
        questionNodes.forEach((node, i) => {
            const angle = (i / numNodes) * 2 * Math.PI;
            const x = container.offsetWidth / 2 + radius * Math.cos(angle) - node.offsetWidth / 2;
            const y = container.offsetHeight / 2 + radius * Math.sin(angle) - node.offsetHeight / 2;
            node.style.left = `${x}px`;
            node.style.top = `${y}px`;
        });

        const goalCenter = getNodeCenter(goalNode);
        let previousNode = goalNode; // The "from" node for inter-question lines

        while (true) { // Loop forever
            for (let i = 0; i < numNodes; i++) {
                const currentNode = questionNodes[i];
                const currentCenter = getNodeCenter(currentNode);
                const previousCenter = getNodeCenter(previousNode);

                // Create the two paths for this step
                const goalPath = createRectangularPath(goalCenter, currentCenter);
                const questionPath = createRectangularPath(previousCenter, currentCenter);
                
                // Add paths to the SVG
                svg.appendChild(goalPath);
                // We only add the question-to-question path if it's not the first loop
                if (previousNode !== goalNode) {
                    svg.appendChild(questionPath);
                }

                // 1. ANIMATE IN
                const tl_in = anime.timeline();
                tl_in.add({
                    targets: currentNode,
                    opacity: [0, 1],
                    scale: [0.95, 1],
                    duration: 500,
                    easing: 'easeOutSine'
                }).add({
                    targets: [goalPath, questionPath],
                    strokeDashoffset: [anime.setDashoffset, 0],
                    duration: 700,
                    easing: 'easeInOutSine'
                }, '-=400'); // Start line animation slightly after node fades in

                await tl_in.finished;
                await delay(HOLD_DURATION);

                // 2. ANIMATE OUT
                const tl_out = anime.timeline();
                tl_out.add({
                    targets: [goalPath, questionPath],
                    strokeDashoffset: [0, anime.setDashoffset],
                    duration: 700,
                    easing: 'easeInOutSine'
                }).add({
                    targets: currentNode,
                    opacity: [1, 0],
                    scale: [1, 0.95],
                    duration: 500,
                    easing: 'easeInSine'
                }, '-=400'); // Start node fade out before line has fully disappeared

                await tl_out.finished;

                // 3. CLEANUP
                goalPath.remove();
                questionPath.remove();
                previousNode = currentNode; // Set up for the next loop
            }
             // Transition from the last question back to the first
            previousNode = questionNodes[numNodes - 1];
        }
    }

    // Start the animation cycle
    cycleQuestions();
});