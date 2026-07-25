-- ====================================================================
-- SCRIPT DE CONFIGURACIÓN AUTOMÁTICA DE SUPABASE PARA EL ARABE ARQUITECTO
-- ====================================================================

-- 1. Crear Tabla para Contenidos Dinámicos del Sitio (Reemplazo Firestore site_content)
CREATE TABLE IF NOT EXISTS public.site_content (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar fila inicial para los textos de la landing page
INSERT INTO public.site_content (id, data) 
VALUES ('landing', '{}'::jsonb) 
ON CONFLICT (id) DO NOTHING;

-- 2. Crear Tabla para la Galería del Portafolio
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    category TEXT,
    category_label TEXT,
    "desc" TEXT,
    url TEXT NOT NULL,
    storage_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear Tabla para Consultas del Formulario de Contacto
CREATE TABLE IF NOT EXISTS public.consultas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    servicio TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- ACTIVAR SEGURIDAD A NIVEL DE FILA (RLS) EN TODAS LAS TABLAS
-- ====================================================================

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad para site_content (Lectura Pública, Escritura Solo Admin Autenticado)
CREATE POLICY "Lectura pública de site_content" ON public.site_content
    FOR SELECT USING (true);

CREATE POLICY "Escritura para administradores de site_content" ON public.site_content
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas de Seguridad para gallery (Lectura Pública, Modificación Solo Admin Autenticado)
CREATE POLICY "Lectura pública de galería" ON public.gallery
    FOR SELECT USING (true);

CREATE POLICY "Modificación por administradores de galería" ON public.gallery
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas de Seguridad para consultas (Inserción Pública, Lectura Solo Admin Autenticado)
CREATE POLICY "Casi cualquiera puede enviar consultas" ON public.consultas
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Lectura por administradores de consultas" ON public.consultas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Eliminación por administradores de consultas" ON public.consultas
    FOR DELETE USING (auth.role() = 'authenticated');

-- ====================================================================
-- ACTIVAR TIEMPO REAL (REALTIME) EN LAS TABLAS
-- ====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_content;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery;
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultas;

-- ====================================================================
-- CONFIGURAR CONTENEDOR DE IMÁGENES EN SUPABASE STORAGE
-- ====================================================================

-- Insertar el cubo (bucket) de almacenamiento 'gallery' de manera pública
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas del Almacenamiento (Storage)
DROP POLICY IF EXISTS "Imágenes de galería son públicas" ON storage.objects;
CREATE POLICY "Imágenes de galería son públicas" ON storage.objects
    FOR SELECT USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Solo administradores autenticados modifican galería" ON storage.objects;
CREATE POLICY "Solo administradores autenticados modifican galería" ON storage.objects
    FOR ALL USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');
