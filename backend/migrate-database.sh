#!/bin/bash

echo "🔄 Database Migration Helper"
echo "============================"
echo ""

# Step 1: Find database
echo "📋 Your PostgreSQL databases:"
psql -l 2>/dev/null | grep -E "^\s+\w" | awk '{print "  - " $1}' | grep -v "template" | grep -v "postgres" | grep -v "List" | grep -v "Name"

echo ""
read -p "Enter the database name you want to migrate: " DB_NAME

if [ -z "$DB_NAME" ]; then
    echo "❌ No database name provided"
    exit 1
fi

# Step 2: Export
BACKUP_FILE="homeless_aid_backup_$(date +%Y%m%d_%H%M%S).sql"
echo ""
echo "📦 Exporting database: $DB_NAME"
echo "   This may take a moment..."

pg_dump $DB_NAME > $BACKUP_FILE 2>/dev/null

if [ $? -eq 0 ]; then
    FILE_SIZE=$(ls -lh $BACKUP_FILE | awk '{print $5}')
    echo "✅ Backup created successfully!"
    echo "   File: $BACKUP_FILE"
    echo "   Size: $FILE_SIZE"
else
    echo "❌ Export failed. Try with username:"
    echo "   pg_dump -U your_username $DB_NAME > $BACKUP_FILE"
    exit 1
fi

# Step 3: Instructions
echo ""
echo "🎯 Next Steps:"
echo "=============="
echo ""
echo "1. Create a cloud database:"
echo "   • Render: https://dashboard.render.com/new/database"
echo "   • Supabase: https://supabase.com/dashboard"
echo "   • Neon: https://neon.tech"
echo ""
echo "2. Get the connection URL (looks like):"
echo "   postgres://user:pass@host.com:5432/dbname"
echo ""
echo "3. Import your data:"
echo "   psql \"your-cloud-database-url\" < $BACKUP_FILE"
echo ""
echo "4. Verify the import:"
echo "   psql \"your-cloud-database-url\" -c \"\\dt\""
echo ""
echo "5. Add to Render environment variables:"
echo "   PG_URI=your-cloud-database-url"
echo ""
echo "📖 For detailed instructions, see: DATABASE_MIGRATION_GUIDE.md"
