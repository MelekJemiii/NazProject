"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category, Level, Course, Lesson } from "@/lib/supabase/types";
import {
  Modal,
  TextField,
  TextArea,
  SelectField,
  Checkbox,
  SubmitRow,
} from "@/components/admin/ui";
import { MediaUpload } from "@/components/admin/media-upload";
import {
  saveCategory,
  deleteCategory,
  saveLevel,
  deleteLevel,
  saveCourse,
  deleteCourse,
  saveLesson,
  deleteLesson,
} from "@/app/admin/actions";

type Entity = "category" | "level" | "course" | "lesson";
type EditorState =
  | { entity: Entity; mode: "create"; parentId?: string; data?: undefined }
  | { entity: Entity; mode: "edit"; data: Category | Level | Course | Lesson }
  | null;

export function CatalogueManager({
  categories,
  levels,
  courses,
  lessons,
}: {
  categories: Category[];
  levels: Level[];
  courses: Course[];
  lessons: Lesson[];
}) {
  const router = useRouter();
  const [editor, setEditor] = useState<EditorState>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
  }

  const levelsByCat = (catId: string) =>
    levels.filter((l) => l.category_id === catId);
  const coursesByLevel = (lvlId: string) =>
    courses.filter((c) => c.level_id === lvlId);
  const lessonsByCourse = (crsId: string) =>
    lessons.filter((l) => l.course_id === crsId);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setEditor({ entity: "category", mode: "create" })}
          className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper hover:opacity-90"
        >
          + Nouvelle matière
        </button>
      </div>

      {categories.length === 0 && (
        <p className="rounded-card border border-dashed border-line bg-card p-8 text-center text-ink-soft">
          Aucune matière. Crée ta première matière pour commencer.
        </p>
      )}

      {categories.map((cat) => (
        <div
          key={cat.id}
          className="overflow-hidden rounded-card border border-line bg-card"
        >
          {/* Category row */}
          <div className="flex items-center gap-3 p-4">
            <button
              onClick={() => toggle(cat.id)}
              className="text-ink-soft"
              aria-label="Déplier"
            >
              {expanded[cat.id] ? "▼" : "▶"}
            </button>
            <span className="text-2xl" aria-hidden>
              {cat.icon ?? "📘"}
            </span>
            <span className="flex-1 font-display text-lg font-semibold text-ink">
              {cat.name}
            </span>
            <span className="text-sm text-ink-soft">
              {levelsByCat(cat.id).length} niveaux
            </span>
            <RowActions
              onEdit={() =>
                setEditor({ entity: "category", mode: "edit", data: cat })
              }
              onDelete={() =>
                confirmDelete(
                  `Supprimer la matière « ${cat.name} » et tout son contenu ?`,
                  () => deleteCategory(cat.id),
                  router,
                )
              }
              onAdd={() =>
                setEditor({
                  entity: "level",
                  mode: "create",
                  parentId: cat.id,
                })
              }
              addLabel="+ Niveau"
            />
          </div>

          {/* Levels */}
          {expanded[cat.id] && (
            <div className="border-t border-line bg-paper-2/40 px-4 pb-3">
              {levelsByCat(cat.id).length === 0 && (
                <p className="py-3 pl-8 text-sm text-ink-soft">
                  Aucun niveau. Ajoute un niveau (ex. Primaire).
                </p>
              )}
              {levelsByCat(cat.id).map((lvl) => (
                <div key={lvl.id} className="mt-2">
                  <div className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5">
                    <button
                      onClick={() => toggle(lvl.id)}
                      className="text-ink-soft"
                      aria-label="Déplier"
                    >
                      {expanded[lvl.id] ? "▼" : "▶"}
                    </button>
                    <span className="flex-1 font-semibold text-ink">
                      {lvl.name}
                    </span>
                    <span className="text-xs text-ink-soft">
                      {coursesByLevel(lvl.id).length} cours
                    </span>
                    <RowActions
                      onEdit={() =>
                        setEditor({ entity: "level", mode: "edit", data: lvl })
                      }
                      onDelete={() =>
                        confirmDelete(
                          `Supprimer le niveau « ${lvl.name} » ?`,
                          () => deleteLevel(lvl.id),
                          router,
                        )
                      }
                      onAdd={() =>
                        setEditor({
                          entity: "course",
                          mode: "create",
                          parentId: lvl.id,
                        })
                      }
                      addLabel="+ Cours"
                    />
                  </div>

                  {/* Courses */}
                  {expanded[lvl.id] && (
                    <div className="ml-6 border-l-2 border-line pl-3">
                      {coursesByLevel(lvl.id).length === 0 && (
                        <p className="py-2 text-sm text-ink-soft">
                          Aucun cours.
                        </p>
                      )}
                      {coursesByLevel(lvl.id).map((crs) => (
                        <div key={crs.id} className="mt-2">
                          <div className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5">
                            <button
                              onClick={() => toggle(crs.id)}
                              className="text-ink-soft"
                              aria-label="Déplier"
                            >
                              {expanded[crs.id] ? "▼" : "▶"}
                            </button>
                            <span className="flex-1 font-semibold text-ink">
                              {crs.title}
                            </span>
                            <StatusBadge status={crs.status} />
                            {crs.is_premium && (
                              <span className="rounded-full bg-sun px-2 py-0.5 text-xs font-extrabold text-ink">
                                {crs.price}€
                              </span>
                            )}
                            <RowActions
                              onEdit={() =>
                                setEditor({
                                  entity: "course",
                                  mode: "edit",
                                  data: crs,
                                })
                              }
                              onDelete={() =>
                                confirmDelete(
                                  `Supprimer le cours « ${crs.title} » ?`,
                                  () => deleteCourse(crs.id),
                                  router,
                                )
                              }
                              onAdd={() =>
                                setEditor({
                                  entity: "lesson",
                                  mode: "create",
                                  parentId: crs.id,
                                })
                              }
                              addLabel="+ Leçon"
                            />
                          </div>

                          {/* Lessons */}
                          {expanded[crs.id] && (
                            <ul className="ml-6 border-l-2 border-line pl-3">
                              {lessonsByCourse(crs.id).length === 0 && (
                                <li className="py-2 text-sm text-ink-soft">
                                  Aucune leçon.
                                </li>
                              )}
                              {lessonsByCourse(crs.id).map((les) => (
                                <li
                                  key={les.id}
                                  className="mt-2 flex items-center gap-3 rounded-xl bg-card px-3 py-2"
                                >
                                  <span className="text-sm" aria-hidden>
                                    {typeIcon(les.type)}
                                  </span>
                                  <span className="flex-1 text-sm font-semibold text-ink">
                                    {les.title}
                                  </span>
                                  <StatusBadge status={les.status} small />
                                  {les.is_premium && (
                                    <span aria-hidden title="Premium">
                                      🔒
                                    </span>
                                  )}
                                  <RowActions
                                    small
                                    onEdit={() =>
                                      setEditor({
                                        entity: "lesson",
                                        mode: "edit",
                                        data: les,
                                      })
                                    }
                                    onDelete={() =>
                                      confirmDelete(
                                        `Supprimer la leçon « ${les.title} » ?`,
                                        () => deleteLesson(les.id),
                                        router,
                                      )
                                    }
                                  />
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {editor && (
        <EntityEditor
          state={editor}
          categories={categories}
          levels={levels}
          courses={courses}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

// ---- Row actions ----------------------------------------------------------
function RowActions({
  onEdit,
  onDelete,
  onAdd,
  addLabel,
  small,
}: {
  onEdit: () => void;
  onDelete: () => void;
  onAdd?: () => void;
  addLabel?: string;
  small?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {onAdd && (
        <button
          onClick={onAdd}
          className="rounded-full bg-paper-2 px-2.5 py-1 text-xs font-bold text-ink hover:bg-line"
        >
          {addLabel}
        </button>
      )}
      <button
        onClick={onEdit}
        className={`rounded-full px-2 py-1 font-bold text-ink-soft hover:text-ink ${small ? "text-xs" : "text-sm"}`}
        aria-label="Modifier"
      >
        ✎
      </button>
      <button
        onClick={onDelete}
        className={`rounded-full px-2 py-1 font-bold text-ink-soft hover:text-francais ${small ? "text-xs" : "text-sm"}`}
        aria-label="Supprimer"
      >
        🗑
      </button>
    </div>
  );
}

function StatusBadge({
  status,
  small,
}: {
  status: string;
  small?: boolean;
}) {
  const published = status === "published";
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-bold ${small ? "text-[10px]" : "text-xs"}`}
      style={{
        background: published
          ? "color-mix(in srgb, var(--grow) 15%, transparent)"
          : "var(--paper-2)",
        color: published ? "var(--grow)" : "var(--ink-soft)",
      }}
    >
      {published ? "Publié" : "Brouillon"}
    </span>
  );
}

function typeIcon(t: string) {
  return t === "video" ? "▶️" : t === "pdf" ? "📄" : t === "quiz" ? "✏️" : "📖";
}

function confirmDelete(
  message: string,
  action: () => Promise<{ ok: boolean; error?: string }>,
  router: ReturnType<typeof useRouter>,
) {
  if (!window.confirm(message)) return;
  action().then((res) => {
    if (!res.ok) window.alert(res.error ?? "Erreur lors de la suppression.");
    router.refresh();
  });
}

// ---- Entity editor modal --------------------------------------------------
function EntityEditor({
  state,
  categories,
  levels,
  courses,
  onClose,
  onSaved,
}: {
  state: NonNullable<EditorState>;
  categories: Category[];
  levels: Level[];
  courses: Course[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const data = state.mode === "edit" ? state.data : undefined;
  const parentId = state.mode === "create" ? state.parentId : undefined;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const id = data?.id;
      let res: { ok: boolean; error?: string };
      switch (state.entity) {
        case "category":
          res = await saveCategory(form, id);
          break;
        case "level":
          res = await saveLevel(form, id);
          break;
        case "course":
          res = await saveCourse(form, id);
          break;
        case "lesson":
          res = await saveLesson(form, id);
          break;
      }
      if (res.ok) onSaved();
      else setError(res.error ?? "Erreur.");
    });
  }

  const titles: Record<Entity, string> = {
    category: "Matière",
    level: "Niveau",
    course: "Cours",
    lesson: "Leçon",
  };
  const title = `${state.mode === "edit" ? "Modifier" : "Nouvelle"} ${titles[state.entity].toLowerCase()}`;

  return (
    <Modal open onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {state.entity === "category" && (
          <CategoryFields data={data as Category | undefined} />
        )}
        {state.entity === "level" && (
          <LevelFields
            data={data as Level | undefined}
            categories={categories}
            parentId={parentId}
          />
        )}
        {state.entity === "course" && (
          <CourseFields
            data={data as Course | undefined}
            levels={levels}
            parentId={parentId}
          />
        )}
        {state.entity === "lesson" && (
          <LessonFields
            data={data as Lesson | undefined}
            courses={courses}
            parentId={parentId}
          />
        )}
        <SubmitRow pending={pending} onCancel={onClose} error={error} />
      </form>
    </Modal>
  );
}

function CategoryFields({ data }: { data?: Category }) {
  return (
    <>
      <TextField label="Nom" name="name" defaultValue={data?.name} required />
      <TextField
        label="Slug (laisser vide pour générer)"
        name="slug"
        defaultValue={data?.slug}
        hint="Utilisé dans l'URL. Ex. : francais"
      />
      <TextArea
        label="Description"
        name="description"
        defaultValue={data?.description}
        rows={2}
      />
      <div className="grid grid-cols-3 gap-3">
        <TextField label="Icône (emoji)" name="icon" defaultValue={data?.icon} placeholder="📚" />
        <TextField label="Couleur" name="color" type="color" defaultValue={data?.color ?? "#4f46e5"} />
        <TextField label="Ordre" name="position" type="number" defaultValue={data?.position ?? 0} />
      </div>
    </>
  );
}

function LevelFields({
  data,
  categories,
  parentId,
}: {
  data?: Level;
  categories: Category[];
  parentId?: string;
}) {
  return (
    <>
      <SelectField
        label="Matière"
        name="category_id"
        defaultValue={data?.category_id ?? parentId}
        required
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
      />
      <TextField label="Nom" name="name" defaultValue={data?.name} required placeholder="Primaire, Collège, A1…" />
      <TextField label="Slug" name="slug" defaultValue={data?.slug} hint="Ex. : primaire" />
      <TextArea label="Description" name="description" defaultValue={data?.description} rows={2} />
      <TextField label="Ordre" name="position" type="number" defaultValue={data?.position ?? 0} />
    </>
  );
}

function CourseFields({
  data,
  levels,
  parentId,
}: {
  data?: Course;
  levels: Level[];
  parentId?: string;
}) {
  return (
    <>
      <SelectField
        label="Niveau"
        name="level_id"
        defaultValue={data?.level_id ?? parentId}
        required
        options={levels.map((l) => ({ value: l.id, label: l.name }))}
      />
      <TextField label="Titre" name="title" defaultValue={data?.title} required />
      <TextField label="Slug" name="slug" defaultValue={data?.slug} />
      <TextArea label="Description" name="description" defaultValue={data?.description} rows={3} />
      <MediaUpload
        name="cover_url"
        bucket="covers"
        accept="image/*"
        label="Image de couverture"
        defaultValue={data?.cover_url}
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Prix (€)" name="price" type="number" defaultValue={data?.price ?? 0} hint="0 si gratuit" />
        <TextField label="Ordre" name="position" type="number" defaultValue={data?.position ?? 0} />
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <Checkbox label="Cours premium" name="is_premium" defaultChecked={data?.is_premium} />
        <SelectField
          label="Statut"
          name="status"
          defaultValue={data?.status ?? "draft"}
          options={[
            { value: "draft", label: "Brouillon" },
            { value: "published", label: "Publié" },
          ]}
        />
      </div>
    </>
  );
}

function LessonFields({
  data,
  courses,
  parentId,
}: {
  data?: Lesson;
  courses: Course[];
  parentId?: string;
}) {
  const [type, setType] = useState<string>(data?.type ?? "article");
  return (
    <>
      <SelectField
        label="Cours"
        name="course_id"
        defaultValue={data?.course_id ?? parentId}
        required
        options={courses.map((c) => ({ value: c.id, label: c.title }))}
      />
      <TextField label="Titre" name="title" defaultValue={data?.title} required />
      <TextField label="Slug" name="slug" defaultValue={data?.slug} />
      <label className="block">
        <span className="mb-1 block text-sm font-bold text-ink">Type de leçon</span>
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-ink"
        >
          <option value="article">📖 Article (texte)</option>
          <option value="video">▶️ Vidéo</option>
          <option value="pdf">📄 Fiche PDF</option>
          <option value="quiz">✏️ Quiz</option>
        </select>
      </label>

      {(type === "article" || type === "video" || type === "pdf") && (
        <TextArea
          label={
            type === "article"
              ? "Contenu (HTML)"
              : "Texte d'accompagnement (HTML, optionnel)"
          }
          name="content"
          defaultValue={data?.content}
          rows={type === "article" ? 8 : 3}
          hint="Tu peux utiliser des balises comme <h2>, <p>, <strong>, <ul><li>…"
        />
      )}
      {type === "video" && (
        <TextField
          label="URL de la vidéo"
          name="video_url"
          defaultValue={data?.video_url}
          hint="YouTube, Vimeo, ou lien direct .mp4"
        />
      )}
      {type === "pdf" && (
        <MediaUpload
          name="file_url"
          bucket="pdfs"
          accept="application/pdf"
          label="Fichier PDF"
          defaultValue={data?.file_url}
        />
      )}
      {type === "quiz" && (
        <p className="rounded-lg bg-paper-2 px-3 py-2 text-sm text-ink-soft">
          Enregistre d'abord la leçon, puis gère les questions du quiz depuis
          le bouton « Questions » (à venir dans l'éditeur de quiz).
        </p>
      )}

      {/* keep hidden defaults so unused fields clear correctly */}
      {type !== "video" && <input type="hidden" name="video_url" value="" />}
      {type !== "pdf" && <input type="hidden" name="file_url" value="" />}

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Durée (min)"
          name="duration_min"
          type="number"
          defaultValue={data?.duration_min ?? ""}
        />
        <TextField label="Ordre" name="position" type="number" defaultValue={data?.position ?? 0} />
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <Checkbox label="Leçon premium" name="is_premium" defaultChecked={data?.is_premium} />
        <SelectField
          label="Statut"
          name="status"
          defaultValue={data?.status ?? "draft"}
          options={[
            { value: "draft", label: "Brouillon" },
            { value: "published", label: "Publié" },
          ]}
        />
      </div>
    </>
  );
}
