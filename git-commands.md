
# Update submodule from origin
git submodule update --remote


# Merge detached Head
git checkout master && git merge HEAD@{1}
