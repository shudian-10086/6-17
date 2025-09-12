document.addEventListener('DOMContentLoaded', () => {
    const image = document.getElementById('interactive-wheel-image');
    if (!image) return;

    let isDragging = false;
    let currentRotation = 0;
    let currentScale = 1;
    let startAngle = 0;
    let centerX, centerY;

    function updateTransform() {
        image.style.transform = `rotate(${currentRotation}deg) scale(${currentScale})`;
    }

    function getDegrees(event) {
        const rect = image.getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;
        const deltaX = event.clientX - centerX;
        const deltaY = event.clientY - centerY;
        return Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    }

    // --- Event Listeners Activation/Deactivation ---
    image.addEventListener('mouseenter', () => {
        image.addEventListener('mousedown', onMouseDown);
        image.addEventListener('wheel', onWheel, { passive: false }); // Need to prevent default page scroll
    });

    image.addEventListener('mouseleave', () => {
        // Deactivate listeners when mouse leaves
        image.removeEventListener('wheel', onWheel);
        // Also ensure dragging stops if mouse leaves while pressed
        if (isDragging) {
            isDragging = false;
            image.style.cursor = 'grab';
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }
    });

    // --- Handler Functions ---
    function onMouseDown(event) {
        event.preventDefault();
        isDragging = true;
        startAngle = getDegrees(event) - currentRotation;
        image.style.cursor = 'grabbing';

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }

    function onMouseMove(event) {
        if (!isDragging) return;
        event.preventDefault();
        const currentAngle = getDegrees(event);
        currentRotation = currentAngle - startAngle;
        updateTransform();
    }

    function onMouseUp(event) {
        event.preventDefault();
        isDragging = false;
        image.style.cursor = 'grab';

        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    }

    function onWheel(event) {
        event.preventDefault(); // Prevent the page from scrolling

        const scaleAmount = 0.1;
        if (event.deltaY < 0) {
            // Zoom in
            currentScale += scaleAmount;
        } else {
            // Zoom out
            currentScale -= scaleAmount;
        }

        // Clamp the scale to a reasonable range
        currentScale = Math.max(0.5, Math.min(currentScale, 3));

        updateTransform();
    }
});
