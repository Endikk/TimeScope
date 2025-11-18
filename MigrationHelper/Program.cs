using Npgsql;

var connectionString = "Host=localhost;Port=5443;Database=timescope_admin;Username=svc_timescope_admin;Password=Admin8s60N5h7";

try
{
    using var conn = new NpgsqlConnection(connectionString);
    conn.Open();

    Console.WriteLine("Connected to PostgreSQL!");

    var addColumnsSQL = @"
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='admin' AND table_name='Users' AND column_name='PhoneNumber') THEN
                ALTER TABLE admin.""Users"" ADD COLUMN ""PhoneNumber"" VARCHAR(20);
            END IF;

            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='admin' AND table_name='Users' AND column_name='JobTitle') THEN
                ALTER TABLE admin.""Users"" ADD COLUMN ""JobTitle"" VARCHAR(100);
            END IF;

            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='admin' AND table_name='Users' AND column_name='Department') THEN
                ALTER TABLE admin.""Users"" ADD COLUMN ""Department"" VARCHAR(100);
            END IF;

            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='admin' AND table_name='Users' AND column_name='HireDate') THEN
                ALTER TABLE admin.""Users"" ADD COLUMN ""HireDate"" TIMESTAMP WITH TIME ZONE;
            END IF;
        END $$;
    ";

    using (var cmd = new NpgsqlCommand(addColumnsSQL, conn))
    {
        cmd.ExecuteNonQuery();
        Console.WriteLine("Columns added successfully!");
    }

    var updateSQL = @"
        UPDATE admin.""Users""
        SET
            ""PhoneNumber"" = '+33 6 12 34 56 78',
            ""JobTitle"" = CASE
                WHEN ""Role"" = 0 THEN 'Administrateur Système'
                WHEN ""Role"" = 1 THEN 'Chef de Projet'
                ELSE 'Développeur Full Stack'
            END,
            ""Department"" = CASE
                WHEN ""Role"" = 0 THEN 'Direction'
                WHEN ""Role"" = 1 THEN 'Management'
                ELSE 'Développement'
            END,
            ""HireDate"" = CURRENT_TIMESTAMP - INTERVAL '1 year'
        WHERE ""PhoneNumber"" IS NULL;
    ";

    using (var cmd = new NpgsqlCommand(updateSQL, conn))
    {
        int rowsAffected = cmd.ExecuteNonQuery();
        Console.WriteLine($"Updated {rowsAffected} users!");
    }

    Console.WriteLine("\nMigration completed successfully!");
    Console.WriteLine("\nYou can now login with:");
    Console.WriteLine("  admin@timescope.com / Admin123!");
    Console.WriteLine("  marie.dupont@timescope.com / Manager123!");
    Console.WriteLine("  jean.martin@timescope.com / Employee123!");
}
catch (Exception ex)
{
    Console.WriteLine($"Error: {ex.Message}");
    return 1;
}

return 0;
