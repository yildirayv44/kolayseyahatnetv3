import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Check for duplicate countries
 * GET /api/admin/countries/check-duplicates
 */
export async function GET() {
  try {
    // Fetch all countries
    const { data: countries, error } = await supabase
      .from("countries")
      .select("id, name, status")
      .eq("status", 1)
      .order("name", { ascending: true });

    if (error) throw error;

    // Group by name to find duplicates
    const nameGroups: Record<string, any[]> = {};
    
    countries?.forEach(country => {
      if (!nameGroups[country.name]) {
        nameGroups[country.name] = [];
      }
      nameGroups[country.name].push(country);
    });

    // Find duplicates
    const duplicates = Object.entries(nameGroups)
      .filter(([_, group]) => group.length > 1)
      .map(([name, group]) => ({
        name,
        count: group.length,
        ids: group.map(c => c.id)
      }));

    // Get total counts
    const totalCountries = countries?.length || 0;
    const uniqueNames = Object.keys(nameGroups).length;
    const duplicateCount = duplicates.reduce((sum, d) => sum + (d.count - 1), 0);

    return NextResponse.json({
      success: true,
      total: totalCountries,
      unique: uniqueNames,
      duplicate_entries: duplicateCount,
      duplicates: duplicates,
      message: duplicates.length > 0 
        ? `${duplicates.length} ülke ismi duplicate, toplam ${duplicateCount} fazla kayıt var`
        : 'Duplicate yok'
    });

  } catch (error: any) {
    console.error('Check duplicates error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Delete duplicate countries (keep oldest)
 * DELETE /api/admin/countries/check-duplicates
 */
export async function DELETE() {
  try {
    // Fetch all countries
    const { data: countries, error } = await supabase
      .from("countries")
      .select("id, name, created_at")
      .eq("status", 1)
      .order("name", { ascending: true });

    if (error) throw error;

    // Group by name
    const nameGroups: Record<string, any[]> = {};
    
    countries?.forEach(country => {
      if (!nameGroups[country.name]) {
        nameGroups[country.name] = [];
      }
      nameGroups[country.name].push(country);
    });

    // Find IDs to delete (keep oldest, delete rest)
    const idsToDelete: number[] = [];
    
    Object.values(nameGroups).forEach(group => {
      if (group.length > 1) {
        // Sort by created_at (oldest first)
        group.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        // Keep first (oldest), delete rest
        for (let i = 1; i < group.length; i++) {
          idsToDelete.push(group[i].id);
        }
      }
    });

    if (idsToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        deleted: 0,
        message: 'No duplicates to delete'
      });
    }

    // Delete duplicates
    const { error: deleteError } = await supabase
      .from("countries")
      .delete()
      .in("id", idsToDelete);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      deleted: idsToDelete.length,
      deleted_ids: idsToDelete,
      message: `${idsToDelete.length} duplicate kayıt silindi`
    });

  } catch (error: any) {
    console.error('Delete duplicates error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
