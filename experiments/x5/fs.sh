
# Run filter-symmetric-pairs.js on 'pass' and compute stats
input_file="pass"
output_file="pass.symmetric"

# Run the filter
node ./filter-symmetric-pairs.js < "$input_file" > "$output_file"

# Count lines before and after
total_pairs=$(wc -l < "$input_file")
kept_pairs=$(wc -l < "$output_file")
discarded_pairs=$((total_pairs - kept_pairs))

# Calculate percent rejected (avoid division by zero)
if [ "$total_pairs" -eq 0 ]; then
  percent_rejected=0
else
  percent_rejected=$(awk "BEGIN { printf \"%.2f\", ($discarded_pairs/$total_pairs)*100 }")
fi

# Output all stats on a single line
echo "Discarded $discarded_pairs/$total_pairs (rejected: $percent_rejected%)"
