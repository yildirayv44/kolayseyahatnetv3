import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Update suggestion status (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action, applyChanges } = await request.json();

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Get the suggestion
    const { data: suggestion, error: fetchError } = await supabaseAdmin
      .from("content_suggestions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !suggestion) {
      return NextResponse.json(
        { error: "Suggestion not found" },
        { status: 404 }
      );
    }

    // Update suggestion status
    const newStatus = action === "approve" ? (applyChanges ? "applied" : "approved") : "rejected";
    
    const { error: updateError } = await supabaseAdmin
      .from("content_suggestions")
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      throw updateError;
    }

    // If approved and applyChanges is true, update the country
    if (action === "approve" && applyChanges && suggestion.field_name && suggestion.country_id) {
      let valueToApply = suggestion.suggested_value;
      
      // Array fields that must be stored as arrays
      const arrayFields = ["required_documents", "important_notes", "application_steps", "travel_tips", "popular_cities"];
      
      if (arrayFields.includes(suggestion.field_name)) {
        // Try to parse JSON if it's a string
        if (typeof valueToApply === 'string') {
          try {
            valueToApply = JSON.parse(valueToApply);
          } catch (parseError) {
            console.error("JSON parse error for field:", suggestion.field_name, parseError);
            // If parsing fails, try to split by newlines or commas
            valueToApply = valueToApply.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean);
          }
        }
        // Ensure it's an array
        if (!Array.isArray(valueToApply)) {
          valueToApply = valueToApply ? [valueToApply] : [];
        }
      }

      console.log("Applying suggestion:", {
        countryId: suggestion.country_id,
        fieldName: suggestion.field_name,
        valueToApply: typeof valueToApply === 'object' ? JSON.stringify(valueToApply).slice(0, 200) : valueToApply?.slice?.(0, 200),
      });

      const { data: updateData, error: countryUpdateError } = await supabaseAdmin
        .from("countries")
        .update({ [suggestion.field_name]: valueToApply })
        .eq("id", suggestion.country_id)
        .select();

      console.log("Update result:", { updateData, countryUpdateError });

      if (countryUpdateError) {
        console.error("Error applying suggestion to country:", countryUpdateError);
        return NextResponse.json({
          success: false,
          warning: "Suggestion approved but failed to apply changes",
          error: countryUpdateError.message,
        });
      }

      if (!updateData || updateData.length === 0) {
        console.error("No rows updated - country not found with id:", suggestion.country_id);
        return NextResponse.json({
          success: false,
          warning: "Suggestion approved but no country found to update",
          countryId: suggestion.country_id,
        });
      }
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      applied: action === "approve" && applyChanges,
    });
  } catch (error: any) {
    console.error("Suggestion update error:", error);
    return NextResponse.json(
      { error: error.message || "Update failed" },
      { status: 500 }
    );
  }
}

// Delete a suggestion
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("content_suggestions")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Suggestion delete error:", error);
    return NextResponse.json(
      { error: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}
