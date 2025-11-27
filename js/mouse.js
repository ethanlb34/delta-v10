/* --------------------------------------------------- */
/* 🖱️ JAVASCRIPT FOR MOUSE HIGHLIGHT EFFECT */
/* --------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    // Select all the navigation links you want the highlight effect on
    const navItems = document.querySelectorAll('.sidebar-nav nav a');

    navItems.forEach(item => {
        // Event listener for mouse movement over the link
        item.addEventListener('mousemove', (e) => {
            // Get the bounding rectangle of the nav item
            const rect = item.getBoundingClientRect();

            // Calculate mouse position relative to the element (from 0 to width/height)
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate the percentage position for the pseudo-element transform
            // We want the center of the highlight to be at the mouse cursor.
            // Since the pseudo-element is 200% wide/high, we need to adjust the translation.
            // The value should be (mouse_position - 100% of the item's dimension).
            // Example: If mouse is at x=50, the offset should be 50 - 100% of 100 (if item is 100 wide)

            // Convert raw pixel position to a translation value for the 200% pseudo-element
            // Formula: (Mouse_Pos / Item_Size) * 100 - 100
            // Simplified: (x / rect.width) * 200 - 100   <-- This moves the center
            
            // To make the highlight follow the mouse *exactly* while being a 200% pseudo-element
            // we calculate the percentage relative to the 200% size.
            const x_percent = (x / rect.width) * 100;
            const y_percent = (y / rect.height) * 100;

            // Update the CSS variables for this specific item's style
            item.style.setProperty('--mouse-x', `${x_percent}%`);
            item.style.setProperty('--mouse-y', `${y_percent}%`);
        });

        // Event listener for when the mouse leaves (optional, but good practice)
        item.addEventListener('mouseleave', () => {
            // Reset the position when the mouse leaves (though CSS opacity handles hiding it)
            // item.style.setProperty('--mouse-x', '-50%');
            // item.style.setProperty('--mouse-y', '-50%');
        });
    });
});