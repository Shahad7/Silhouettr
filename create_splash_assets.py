#!/usr/bin/env python3
"""
Create splash screen assets for Shape Guess Challenge game.
Generates a background image and logo that capture the creative puzzle-solving nature.
"""

from PIL import Image, ImageDraw, ImageFont
import math
import random

def create_splash_background():
    """Create an engaging splash background with geometric shapes and gradients."""
    # Create a large canvas for high quality
    width, height = 800, 600
    img = Image.new('RGB', (width, height), '#000000')
    draw = ImageDraw.Draw(img)
    
    # Create a dynamic gradient background
    for y in range(height):
        # Multi-color gradient from dark blue to purple to dark teal
        ratio = y / height
        if ratio < 0.5:
            # Dark blue to purple
            r = int(20 + (60 - 20) * (ratio * 2))
            g = int(25 + (40 - 25) * (ratio * 2))
            b = int(80 + (120 - 80) * (ratio * 2))
        else:
            # Purple to dark teal
            ratio_adj = (ratio - 0.5) * 2
            r = int(60 + (30 - 60) * ratio_adj)
            g = int(40 + (80 - 40) * ratio_adj)
            b = int(120 + (100 - 120) * ratio_adj)
        
        color = (r, g, b)
        draw.line([(0, y), (width, y)], fill=color)
    
    # Add geometric pattern overlay
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    
    # Create scattered geometric shapes representing the game's Unicode shapes
    shapes_data = [
        # Circles (●, ⬤)
        {'type': 'circle', 'pos': (150, 100), 'size': 40, 'alpha': 60},
        {'type': 'circle', 'pos': (650, 150), 'size': 25, 'alpha': 80},
        {'type': 'circle', 'pos': (200, 400), 'size': 35, 'alpha': 70},
        {'type': 'circle', 'pos': (600, 450), 'size': 30, 'alpha':
 65},
       # Triangles (▲, ▼)
        {'type': 'triangle_up', 'pos': (300, 80), 'size': 45, 'alpha': 75},
        {'type': 'triangle_down', 'pos': (500, 200), 'size': 35, 'alpha': 85},
        {'type': 'triangle_up', 'pos': (100, 300), 'size': 40, 'alpha': 70},
        
        # Rectangles (▮, ⬛)
        {'type': 'rectangle', 'pos': (400, 120), 'size': 50, 'alpha': 65},
        {'type': 'rectangle', 'pos': (250, 250), 'size': 35, 'alpha': 80},
        {'type': 'rectangle', 'pos': (550, 350), 'size': 45, 'alpha': 75},
        
        # Diamonds (♦, ◆)
        {'type': 'diamond', 'pos': (350, 300), 'size': 40, 'alpha': 70},
        {'type': 'diamond', 'pos': (150, 500), 'size': 30, 'alpha': 85},
        {'type': 'diamond', 'pos': (700, 300), 'size': 35, 'alpha': 75},
        
        # Stars (★)
        {'type': 'star', 'pos': (450, 400), 'size': 45, 'alpha': 80},
        {'type': 'star', 'pos': (80, 180), 'size': 25, 'alpha': 90},
    ]
    
    # Draw the shapes with subtle glow effect
    for shape in shapes_data:
        x, y = shape['pos']
        size = shape['size']
        alpha = shape['alpha']
        
        # Create a subtle glow by drawing multiple layers
        glow_color = (255, 255, 255, alpha // 3)
        main_color = (255, 255, 255, alpha)
        
        if shape['type'] == 'circle':
            # Glow effect
            overlay_draw.ellipse([x-size//2-5, y-size//2-5, x+size//2+5, y+size//2+5], fill=glow_color)
            # Main shape
            overlay_draw.ellipse([x-size//2, y-size//2, x+size//2, y+size//2], fill=main_color)
            
        elif shape['type'] == 'triangle_up':
            # Triangle pointing up
            points = [(x, y-size//2), (x-size//2, y+size//2), (x+size//2, y+size//2)]
            glow_points = [(x, y-size//2-3), (x-size//2-3, y+size//2+3), (x+size//2+3, y+size//2+3)]
            overlay_draw.polygon(glow_points, fill=glow_color)
            overlay_draw.polygon(points, fill=main_color)
            
        elif shape['type'] == 'triangle_down':
            # Triangle pointing down
            points = [(x, y+size//2), (x-size//2, y-size//2), (x+size//2, y-size//2)]
            glow_points = [(x, y+size//2+3), (x-size//2-3, y-size//2-3), (x+size//2+3, y-size//2-3)]
            overlay_draw.polygon(glow_points, fill=glow_color)
            overlay_draw.polygon(points, fill=main_color)
            
        elif shape['type'] == 'rectangle':
            # Rectangle
            overlay_draw.rectangle([x-size//2-3, y-size//3-3, x+size//2+3, y+size//3+3], fill=glow_color)
            overlay_draw.rectangle([x-size//2, y-size//3, x+size//2, y+size//3], fill=main_color)
            
        elif shape['type'] == 'diamond':
            # Diamond
            points = [(x, y-size//2), (x+size//2, y), (x, y+size//2), (x-size//2, y)]
            glow_points = [(x, y-size//2-3), (x+size//2+3, y), (x, y+size//2+3), (x-size//2-3, y)]
            overlay_draw.polygon(glow_points, fill=glow_color)
            overlay_draw.polygon(points, fill=main_color)
            
        elif shape['type'] == 'star':
            # 5-pointed star
            points = []
            glow_points = []
            for i in range(10):
                angle = i * math.pi / 5
                if i % 2 == 0:
                    # Outer points
                    px = x + (size//2) * math.cos(angle - math.pi/2)
                    py = y + (size//2) * math.sin(angle - math.pi/2)
                    gx = x + (size//2 + 3) * math.cos(angle - math.pi/2)
                    gy = y + (size//2 + 3) * math.sin(angle - math.pi/2)
                else:
                    # Inner points
                    px = x + (size//4) * math.cos(angle - math.pi/2)
                    py = y + (size//4) * math.sin(angle - math.pi/2)
                    gx = x + (size//4 + 2) * math.cos(angle - math.pi/2)
                    gy = y + (size//4 + 2) * math.sin(angle - math.pi/2)
                points.append((px, py))
                glow_points.append((gx, gy))
            
            overlay_draw.polygon(glow_points, fill=glow_color)
            overlay_draw.polygon(points, fill=main_color)
    
    # Composite the overlay onto the background
    img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
    
    # Add subtle texture with noise
    noise_overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    noise_draw = ImageDraw.Draw(noise_overlay)
    
    for _ in range(1000):
        x = random.randint(0, width)
        y = random.randint(0, height)
        alpha = random.randint(5, 15)
        noise_draw.point((x, y), fill=(255, 255, 255, alpha))
    
    img = Image.alpha_composite(img.convert('RGBA'), noise_overlay).convert('RGB')
    
    return img

def create_app_logo():
    """Create a distinctive black and white logo for the Shape Guess Challenge app."""
    # Create logo canvas
    size = 512
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Create a circular background - simple black circle
    center = size // 2
    radius = size // 2 - 20
    
    # Draw solid black circle background
    draw.ellipse([center-radius, center-radius, center+radius, center+radius], 
                fill=(0, 0, 0, 255))
    
    # Add a white border
    draw.ellipse([center-radius, center-radius, center+radius, center+radius], 
                outline=(255, 255, 255, 255), width=6)
    
    # Create the main logo design - a house made of shapes
    # This represents the "guess the shape" concept
    
    # White house components
    white_color = (255, 255, 255, 255)
    black_color = (0, 0, 0, 255)
    
    # House roof (white triangle)
    roof_points = [(center, center-80), (center-60, center-20), (center+60, center-20)]
    draw.polygon(roof_points, fill=white_color)
    
    # House body (white rectangle)
    draw.rectangle([center-50, center-20, center+50, center+60], fill=white_color)
    
    # Door (black rectangle) - as requested
    draw.rectangle([center-15, center+20, center+15, center+60], fill=black_color)
    
    # Window (white circle with black outline for definition)
    draw.ellipse([center-35, center-5, center-15, center+15], fill=white_color)
    draw.ellipse([center-35, center-5, center-15, center+15], outline=black_color, width=2)
    
    # Add decorative elements around the main design
    # Small white shapes floating around to suggest creativity and variety
    decorative_shapes = [
        {'type': 'star', 'pos': (center-120, center-60), 'size': 20},
        {'type': 'diamond', 'pos': (center+120, center-40), 'size': 18},
        {'type': 'circle', 'pos': (center-100, center+80), 'size': 15},
        {'type': 'triangle', 'pos': (center+110, center+70), 'size': 22},
    ]
    
    for shape in decorative_shapes:
        x, y = shape['pos']
        s = shape['size']
        white_alpha = (255, 255, 255, 200)
        
        if shape['type'] == 'star':
            # 5-pointed star
            points = []
            for i in range(10):
                angle = i * math.pi / 5
                if i % 2 == 0:
                    px = x + (s//2) * math.cos(angle - math.pi/2)
                    py = y + (s//2) * math.sin(angle - math.pi/2)
                else:
                    px = x + (s//4) * math.cos(angle - math.pi/2)
                    py = y + (s//4) * math.sin(angle - math.pi/2)
                points.append((px, py))
            draw.polygon(points, fill=white_alpha)
            
        elif shape['type'] == 'diamond':
            points = [(x, y-s//2), (x+s//2, y), (x, y+s//2), (x-s//2, y)]
            draw.polygon(points, fill=white_alpha)
            
        elif shape['type'] == 'circle':
            draw.ellipse([x-s//2, y-s//2, x+s//2, y+s//2], fill=white_alpha)
            
        elif shape['type'] == 'triangle':
            points = [(x, y-s//2), (x-s//2, y+s//2), (x+s//2, y+s//2)]
            draw.polygon(points, fill=white_alpha)
    
    return img

def main():
    """Generate both splash background and app logo."""
    print("Creating Shape Guess Challenge splash assets...")
    
    # Create splash background
    print("Generating splash background...")
    splash_bg = create_splash_background()
    splash_bg.save('assets/shape-challenge-splash.png', 'PNG', quality=95)
    print("✓ Splash background saved as 'assets/shape-challenge-splash.png'")
    
    # Create app logo
    print("Generating app logo...")
    logo = create_app_logo()
    logo.save('assets/shape-challenge-logo.png', 'PNG', quality=95)
    print("✓ App logo saved as 'assets/shape-challenge-logo.png'")
    
    print("\n🎯 Shape Guess Challenge assets created successfully!")
    print("\nTo use these assets in your devvit.json splash configuration:")
    print("- backgroundUri: 'shape-challenge-splash.png'")
    print("- appIconUri: 'shape-challenge-logo.png'")

if __name__ == "__main__":
    main()
