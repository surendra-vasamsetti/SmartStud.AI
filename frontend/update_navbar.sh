#!/bin/bash

# List of files to update
files=(
  "SQLCourseOverview.jsx"
  "NetworksCourseOverview.jsx"
  "JSCourseOverview.jsx"
  "JavaCourseOverview.jsx"
  "HTMLCourseOverview.jsx"
  "CSSCourseOverview.jsx"
  "CourseOverviewPage.jsx"
  "CourseLearningView.jsx"
  "AICourseGenerator.jsx"
  "Libraryy.jsx"
  "Quizzes.jsx"
  "Performance.jsx"
)

for file in "${files[@]}"; do
  filepath="c:/Users/Surendra/Downloads/smart-llm/smartstud/llm-ss/frontend/src/components/$file"
  
  # Check if file exists
  if [ ! -f "$filepath" ]; then
    echo "Skipping $file - not found"
    continue
  fi
  
  echo "Updating $file..."
  
  # Add import for useCurrentUser after Navbar import
  sed -i '/import Navbar from/a import { useCurrentUser } from "../hooks/useCurrentUser";' "$filepath"
  
  # Add hook usage after isMobile state (look for common pattern)
  sed -i '/const \[isMobile, setIsMobile\] = useState(window.innerWidth < 768);/a \  const { username, email } = useCurrentUser();' "$filepath"
  
  # Update Navbar component calls to include username and email
  sed -i 's/<Navbar toggleSidebar={\([^}]*\)} \/>/<Navbar toggleSidebar={\1} username={username} email={email} \/>/g' "$filepath"
  
  echo "✓ Updated $file"
done

echo "All files updated!"
