#!/bin/bash
# QuickCommerce Backend EC2 Setup Script
# Run this script on a fresh Ubuntu 22.04 t2.micro/t3.micro instance

set -e

echo "========================================="
echo "QuickCommerce Backend EC2 Setup"
echo "========================================="

# Update system packages
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Python 3.11 and pip
echo "Installing Python 3.11..."
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install PostgreSQL client (for connecting to RDS)
echo "Installing PostgreSQL client..."
sudo apt install -y postgresql-client libpq-dev

# Install Nginx
echo "Installing Nginx..."
sudo apt install -y nginx

# Install Git (for cloning repository)
echo "Installing Git..."
sudo apt install -y git

# Create application directory
echo "Creating application directory..."
sudo mkdir -p /var/www/quickcommerce
sudo chown -R ubuntu:ubuntu /var/www/quickcommerce

# Clone your repository (replace with your actual repo URL)
echo "Cloning repository..."
cd /var/www/quickcommerce
# git clone https://github.com/yourusername/quickcommerce.git .

# For now, you'll need to manually upload your backend folder
echo "NOTE: Upload your backend code to /var/www/quickcommerce/backend/"
echo "You can use: scp -r backend/ ubuntu@your-ec2-ip:/var/www/quickcommerce/"

# Create Python virtual environment
echo "Creating Python virtual environment..."
cd /var/www/quickcommerce/backend
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file (you'll need to populate this manually)
echo "Creating .env file template..."
cat > .env << 'EOL'
# AWS Bedrock Credentials
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1

# JWT Configuration
SECRET_KEY=generate-a-strong-random-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Environment
ENVIRONMENT=production

# Database Configuration
DATABASE_URL=postgresql://dbuser:dbpassword@your-rds-endpoint.region.rds.amazonaws.com:5432/quickcommerce
EOL

echo ""
echo "========================================="
echo "IMPORTANT: Edit /var/www/quickcommerce/backend/.env with your actual credentials!"
echo "nano /var/www/quickcommerce/backend/.env"
echo "========================================="
echo ""

# Initialize database (run migrations)
echo "Database initialization will be done after .env is configured"
echo "Run: source /var/www/quickcommerce/backend/venv/bin/activate && python -c 'from backend.database import engine; from backend.models import Base; Base.metadata.create_all(bind=engine)'"

# Create systemd service
echo "Creating systemd service..."
sudo tee /etc/systemd/system/quickcommerce.service > /dev/null << 'EOL'
[Unit]
Description=QuickCommerce FastAPI Application
After=network.target

[Service]
Type=notify
User=ubuntu
Group=ubuntu
WorkingDirectory=/var/www/quickcommerce
Environment="PATH=/var/www/quickcommerce/backend/venv/bin"
ExecStart=/var/www/quickcommerce/backend/venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port 8080 --workers 2
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOL

# Configure Nginx
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/quickcommerce > /dev/null << 'EOL'
server {
    listen 80;
    server_name _;  # Replace with your domain or EC2 public IP
    
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (if needed in future)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOL

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/quickcommerce /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "Testing Nginx configuration..."
sudo nginx -t

# Reload systemd and start services
echo "Starting services..."
sudo systemctl daemon-reload
sudo systemctl enable quickcommerce
sudo systemctl restart nginx

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Edit /var/www/quickcommerce/backend/.env with actual credentials"
echo "2. Initialize database: sudo systemctl start quickcommerce"
echo "3. Check status: sudo systemctl status quickcommerce"
echo "4. View logs: sudo journalctl -u quickcommerce -f"
echo "5. Configure AWS EC2 Security Group to allow HTTP (port 80) inbound traffic"
echo ""
echo "Your API will be available at: http://YOUR_EC2_PUBLIC_IP/"
echo "API docs at: http://YOUR_EC2_PUBLIC_IP/docs"
echo ""
